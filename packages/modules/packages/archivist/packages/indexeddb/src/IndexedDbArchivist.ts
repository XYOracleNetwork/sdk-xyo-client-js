import { exists } from '@xylabs/exists'
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
import { DBSchema, IDBPDatabase, openDB } from 'idb'

import { AbstractIndexedDbArchivist } from './AbstractIndexedDbArchivist'

export type IndexedDbArchivistConfigSchema = 'network.xyo.archivist.indexeddb.config'
export const IndexedDbArchivistConfigSchema: IndexedDbArchivistConfigSchema = 'network.xyo.archivist.indexeddb.config'

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

export interface PreviousHashStoreSchemaV1 extends DBSchema {
  archivist: {
    key: string
    value: Payload
  }
}

export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractIndexedDbArchivist<TParams, TEventData> {
  static readonly CurrentSchemaVersion = 1
  static override configSchemas = [IndexedDbArchivistConfigSchema]

  private db: Promise<IDBPDatabase<PreviousHashStoreSchemaV1>> | undefined = undefined

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    return this.config?.dbName ?? this.config?.name ?? IndexedDbArchivist.defaultDbName
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
    return this.config?.storeName ?? IndexedDbArchivist.defaultStoreName
  }

  override async start(): Promise<void> {
    await super.start()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this.db = openDB<PreviousHashStoreSchemaV1>(this.dbName, IndexedDbArchivist.CurrentSchemaVersion, {
      upgrade: (db) => db.createObjectStore(this.storeName as 'archivist'),
    })
  }

  protected override async allHandler(): Promise<Payload[]> {
    return (await this.db)?.getAll(this.storeName as 'archivist') ?? []
  }

  protected override async clearHandler(): Promise<void> {
    await (await this.db)?.clear(this.storeName as 'archivist')
  }

  protected override async deleteHandler(hashes: string[]): Promise<boolean[]> {
    await Promise.all(
      hashes.map(async (hash) => {
        await (await this.db)?.delete(this.storeName as 'archivist', hash)
      }),
    )
    return hashes.map((_) => true)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const results = (
      await Promise.all(
        hashes.map(async (hash) => {
          return await (await this.db)?.get(this.storeName as 'archivist', hash)
        }),
      )
    ).filter(exists)
    return results
  }

  protected async insertHandler(payloads: Payload[]): Promise<BoundWitness[]> {
    await Promise.all(
      payloads.map(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        await (await this.db)?.put(this.storeName as 'archivist', payload, hash)
      }),
    )
    const [result] = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, payloads)
    return [result[0]]
  }
}
