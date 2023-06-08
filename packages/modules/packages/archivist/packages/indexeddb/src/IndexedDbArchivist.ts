import { assertEx } from '@xylabs/assert'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
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
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { clear, createStore, delMany, entries, getMany, setMany, UseStore } from 'idb-keyval'

export type IndexedDbArchivistConfigSchema = 'network.xyo.module.config.archivist.indexeddb'
export const IndexedDbArchivistConfigSchema: IndexedDbArchivistConfigSchema = 'network.xyo.module.config.archivist.indexeddb'

export type IndexedDbArchivistConfig = ArchivistConfig<{
  /**
   * The database name
   */
  dbName?: string
  schema: IndexedDbArchivistConfigSchema
  /**
   * The name of the object store
   */
  storeName?: string
}>

export type IndexedDbArchivistParams = ArchivistParams<AnyConfigSchema<IndexedDbArchivistConfig>>

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchema = IndexedDbArchivistConfigSchema

  private _db: UseStore | undefined

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    return this.config?.dbName ?? this.config?.name ?? 'archivist'
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistClearQuerySchema, ArchivistDeleteQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }

  get storeName() {
    return this.config?.storeName ?? 'payloads'
  }

  private get db(): UseStore {
    return assertEx(this._db, 'DB not initialized')
  }

  override async all(): Promise<Payload[]> {
    const result = await entries<string, Payload>(this.db)
    return result.map<Payload>(([_hash, payload]) => payload)
  }

  override async clear(): Promise<void> {
    await clear(this.db)
  }

  override async delete(hashes: string[]): Promise<boolean[]> {
    await delMany(hashes, this.db)
    return hashes.map((_) => true)
  }

  override async get(hashes: string[]): Promise<Payload[]> {
    const result = await getMany<Payload>(hashes, this.db)
    return result
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const entries = await Promise.all(
      payloads.map<Promise<[string, Payload]>>(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        return [hash, payload]
      }),
    )
    await setMany(entries, this.db)
    const result = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    return [result[0]]
  }

  override async start(): Promise<void> {
    await super.start()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this._db = createStore(this.dbName, this.storeName)
  }
}
