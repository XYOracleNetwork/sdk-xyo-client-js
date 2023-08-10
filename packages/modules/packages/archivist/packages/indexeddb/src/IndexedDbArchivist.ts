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
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { clear, createStore, delMany, entries, getMany, setMany, UseStore } from 'idb-keyval'

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

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchemas = [IndexedDbArchivistConfigSchema]
  static defaultDbName = 'archivist'
  static defaultStoreName = 'payloads'

  private _db: UseStore | undefined

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

  private get db(): UseStore {
    return assertEx(this._db, 'DB not initialized')
  }

  protected override async allHandler(): Promise<Payload[]> {
    const result = await entries<string, Payload>(this.db)
    return result.map<Payload>(([_hash, payload]) => payload)
  }

  protected override async clearHandler(): Promise<void> {
    await clear(this.db)
  }

  protected override async deleteHandler(hashes: string[]): Promise<Payload[]> {
    const payloadPairs: [string, Payload][] = await Promise.all(
      (await this.get(hashes)).map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
    )

    const foundHashesToDelete = payloadPairs.map(([hash, _]) => hash)
    await delMany(foundHashesToDelete, this.db)

    await this.emit('deleted', { hashes: foundHashesToDelete, module: this })
    const result = payloadPairs.map(([_, payload]) => payload)
    return result
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const found = await getMany<Payload>(hashes, this.db)
    // If we found everything or we don't have parents, return what we have
    if (found.length === hashes.length || !(await this.parents())?.read) return found
    // Otherwise, check parents for any hashes we were unable to find
    const foundHashes = await Promise.all(found.map(PayloadHasher.hashAsync))
    const notfound = hashes.filter((hash) => !foundHashes.includes(hash))
    const parentFound = notfound.length > 0 ? await super.getHandler(notfound) : []
    return [...found, ...parentFound]
  }

  protected async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const entries = await Promise.all(
      payloads.map<Promise<[string, Payload]>>(async (payload) => {
        const hash = await PayloadHasher.hashAsync(payload)
        return [hash, payload]
      }),
    )
    await setMany(entries, this.db)
    await this.writeToParents(payloads)
    return payloads
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this._db = createStore(this.dbName, this.storeName)
    return true
  }
}
