import { assertEx } from '@xylabs/assert'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { clear, createStore, delMany, entries, getMany, setMany, UseStore } from 'idb-keyval'

import { AbstractIndexedDbArchivist } from './AbstractIndexedDbArchivist'

export type IndexedDbArchivistSimpleConfigSchema = 'network.xyo.archivist.indexeddb.config'
export const IndexedDbArchivistSimpleConfigSchema: IndexedDbArchivistSimpleConfigSchema = 'network.xyo.archivist.indexeddb.config'

export type IndexedDbArchivistSimpleConfig = ArchivistConfig<{
  /**
   * The database name
   */
  dbName?: string
  schema: IndexedDbArchivistSimpleConfigSchema
  /**
   * The name of the object store
   */
  storeName?: string
}>

export type IndexedDbArchivistSimpleParams = ArchivistParams<AnyConfigSchema<IndexedDbArchivistSimpleConfig>>

export class IndexedDbArchivistSimple<
  TParams extends IndexedDbArchivistSimpleParams = IndexedDbArchivistSimpleParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractIndexedDbArchivist<TParams, TEventData> {
  static override configSchemas = [IndexedDbArchivistSimpleConfigSchema]

  private _db: UseStore | undefined

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    return this.config?.dbName ?? this.config?.name ?? IndexedDbArchivistSimple.defaultDbName
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistClearQuerySchema, ArchivistDeleteQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }
  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`. The limitation of the current IndexedDB wrapper we're
   * using is that it only supports a single object store per DB. See here:
   * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
   * If this becomes a problem or we need migrations/transactions, we can
   * move to this more-flexible library, which they recommend (and who
   * recommends them for our simple use case of key-value storage):
   * https://www.npmjs.com/package/idb
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbArchivistSimple.defaultStoreName
  }

  private get db(): UseStore {
    return assertEx(this._db, 'DB not initialized')
  }

  override async start(): Promise<void> {
    await super.start()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this._db = createStore(this.dbName, this.storeName)
  }

  protected override async allHandler(): Promise<Payload[]> {
    const result = await entries<string, Payload>(this.db)
    return result.map<Payload>(([_hash, payload]) => payload)
  }

  protected override async clearHandler(): Promise<void> {
    await clear(this.db)
  }

  protected override async deleteHandler(hashes: string[]): Promise<boolean[]> {
    await delMany(hashes, this.db)
    return hashes.map((_) => true)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const result = await getMany<Payload>(hashes, this.db)
    return result
  }

  protected async insertHandler(payloads: Payload[]): Promise<BoundWitness[]> {
    const entries = await Promise.all(
      payloads.map<Promise<[string, Payload]>>(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        return [hash, payload]
      }),
    )
    await setMany(entries, this.db)
    const [result] = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    return [result[0]]
  }
}
