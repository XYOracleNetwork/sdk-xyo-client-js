import { assertEx } from '@xylabs/assert'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { IDBPDatabase, IDBPObjectStore, openDB } from 'idb'

import { IndexedDbPayloadDivinerConfigSchema } from './Config'
import { IndexedDbPayloadDivinerParams } from './Params'

export interface PayloadStore {
  [s: string]: Payload
}

export class IndexedDbPayloadDiviner<
  TParams extends IndexedDbPayloadDivinerParams = IndexedDbPayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [IndexedDbPayloadDivinerConfigSchema]
  static defaultDbName = 'archivist'
  static defaultDbVersion = 1
  static defaultStoreName = 'payloads'

  private _db: IDBPDatabase<PayloadStore> | undefined

  /**
   * The database name. If not supplied via config it defaults to
   * `archivist`. This behavior biases towards a single, isolated
   * DB per archivist which seems to make the most sense for 99% of
   * use cases.
   */
  get dbName() {
    return this.config?.dbName ?? IndexedDbPayloadDiviner.defaultDbName
  }

  /**
   * The database version. If not supplied via config, it defaults to 1.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbPayloadDiviner.defaultDbVersion
  }

  /**
   * The database indexes.
   */
  get indexes() {
    return this.config?.storage?.indexes ?? []
  }

  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`.
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbPayloadDiviner.defaultStoreName
  }

  private get db(): IDBPDatabase<PayloadStore> {
    return assertEx(this._db, 'DB not initialized')
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const query = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schemas, limit, offset, hash, order, schema: _schema, sources, ...props } = query as unknown as TIn & { sources?: string[] }
    const tx = this.db.transaction(this.storeName, 'readonly')
    const store = tx.objectStore(this.storeName)
    const results: TOut[] = []
    let parsedOffset = offset ?? 0
    const parsedLimit = limit ?? 10
    assertEx((schemas?.length ?? 1) === 1, 'IndexedDbPayloadDiviner: Only one filter schema supported')
    const filterSchema = schemas?.[0]
    const filter = filterSchema ? { schema: filterSchema, ...props } : { ...props }
    const direction: IDBCursorDirection = order === 'desc' ? 'prev' : 'next'
    const suggestedIndex = this.selectBestIndex(filter, store)
    const filterValues = this.getKeyValuesFromQuery(suggestedIndex, filter)
    let cursor = suggestedIndex
      ? // Conditionally filter on schemas
        await store.index(suggestedIndex).openCursor(IDBKeyRange.only(filterValues.length === 1 ? filterValues[0] : filterValues), direction)
      : // Just iterate all records
        await store.openCursor(suggestedIndex, direction)

    // Skip records until the offset is reached
    while (cursor && parsedOffset > 0) {
      cursor = await cursor.advance(parsedOffset)
      parsedOffset = 0 // Reset offset after skipping
    }
    // Collect results up to the limit
    while (cursor && results.length < parsedLimit) {
      results.push(cursor.value)
      cursor = await cursor.continue()
    }
    await tx.done
    // Remove any metadata before returning to the client
    return results.map((payload) => PayloadHasher.jsonPayload(payload))
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this._db = await openDB<PayloadStore>(this.dbName, this.dbVersion)
    return true
  }

  private getKeyValuesFromQuery(indexName: string | null, query: AnyObject): unknown[] {
    if (!indexName) return []
    // Function to extract fields from an index name
    const extractFields = (indexName: string): string[] => {
      return indexName
        .slice(3)
        .split('_')
        .map((field) => field.toLowerCase())
    }

    // Extracting the relevant fields from the index name
    const indexFields = extractFields(indexName)

    // Collecting the values for these fields from the query object
    return indexFields.map((field) => query[field as keyof AnyObject])
  }

  private selectBestIndex(query: AnyObject, store: IDBPObjectStore<PayloadStore>): string | null {
    // List of available indexes
    const { indexNames } = store

    // Function to extract fields from an index name
    const extractFields = (indexName: string): string[] => {
      return indexName
        .slice(3)
        .split('_')
        .map((field) => field.toLowerCase())
    }

    // Convert query object keys to a set for easier comparison
    const queryKeys = new Set(Object.keys(query).map((key) => key.toLowerCase()))

    // Find the best matching index
    let bestMatch: { indexName: string; matchCount: number } = { indexName: '', matchCount: 0 }

    for (const indexName of indexNames) {
      const indexFields = extractFields(indexName)
      const matchCount = indexFields.filter((field) => queryKeys.has(field)).length
      if (matchCount > bestMatch.matchCount) {
        bestMatch = { indexName, matchCount }
      }
    }
    return bestMatch.matchCount > 0 ? bestMatch.indexName : null
  }
}
