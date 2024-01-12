import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { IndexSeparator } from '@xyo-network/archivist-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { IDBPDatabase, IDBPObjectStore, openDB } from 'idb'

import { IndexedDbPayloadDivinerConfigSchema } from './Config'
import { IndexedDbPayloadDivinerParams } from './Params'

interface PayloadStore {
  [s: string]: Payload
}

type AnyPayload = Payload<Record<string, unknown>>

type ValueFilter = (payload?: AnyPayload | null) => boolean

const payloadValueFilter = (key: keyof AnyPayload, value?: unknown | unknown[]): ValueFilter | undefined => {
  if (!value) return undefined
  return (payload) => {
    if (!payload) return false
    const sourceValue = payload?.[key]
    if (sourceValue === undefined) return false
    return Array.isArray(sourceValue) && Array.isArray(value) ? containsAll(sourceValue, value) : sourceValue == value
  }
}

export class IndexedDbPayloadDiviner<
  TParams extends IndexedDbPayloadDivinerParams = IndexedDbPayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [IndexedDbPayloadDivinerConfigSchema]

  private _db: IDBPDatabase<PayloadStore> | undefined

  /**
   * The database name. If not supplied via config, it defaults
   * to the archivist's name and if archivist's name is not supplied,
   * it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    return this.config?.dbName ?? this.config?.archivist ?? IndexedDbArchivist.defaultDbName
  }

  /**
   * The database version. If not supplied via config, it defaults to the archivist default version.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbArchivist.defaultDbVersion
  }

  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`.
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbArchivist.defaultStoreName
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const query = payloads?.filter(isPayloadDivinerQueryPayload)?.pop()
    if (!query) return []
    const db = await this.tryGetInitializedDb()
    if (!db) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schemas, limit, offset, hash, order, schema: _schema, sources, ...props } = query as unknown as TIn & { sources?: string[] }
    const tx = db.transaction(this.storeName, 'readonly')
    const store = tx.objectStore(this.storeName)
    const results: TOut[] = []
    let parsedOffset = offset ?? 0
    const parsedLimit = limit ?? 10
    assertEx((schemas?.length ?? 1) === 1, 'IndexedDbPayloadDiviner: Only one filter schema supported')
    const filterSchema = schemas?.[0]
    const filter = filterSchema ? { schema: filterSchema, ...props } : { ...props }
    const direction: IDBCursorDirection = order === 'desc' ? 'prev' : 'next'
    const suggestedIndex = this.selectBestIndex(filter, store)
    const keyRangeValue = this.getKeyRangeValue(suggestedIndex, filter)
    const valueFilters: ValueFilter[] = props
      ? Object.entries(props)
          .map(([key, value]) => payloadValueFilter(key, value))
          .filter(exists)
      : []
    let cursor = suggestedIndex
      ? // Conditionally filter on schemas
        await store.index(suggestedIndex).openCursor(IDBKeyRange.only(keyRangeValue), direction)
      : // Just iterate all records
        await store.openCursor(suggestedIndex, direction)

    // Skip records until the offset is reached
    while (cursor && parsedOffset > 0) {
      cursor = await cursor.advance(parsedOffset)
      parsedOffset = 0 // Reset offset after skipping
    }
    // Collect results up to the limit
    while (cursor && results.length < parsedLimit) {
      const value = cursor.value
      if (value) {
        // If we're filtering on more than just the schema
        if (valueFilters.length > 0) {
          // Ensure all filters pass
          if (valueFilters.every((filter) => filter(value))) {
            // Then save the value
            results.push(value)
          }
        } else {
          // Otherwise just save the value
          results.push(value)
        }
      }
      cursor = await cursor.continue()
    }
    await tx.done
    // Remove any metadata before returning to the client
    return results.map((payload) => PayloadHasher.jsonPayload(payload))
  }

  protected override async startHandler() {
    await super.startHandler()
    return true
  }

  private getKeyRangeValue(indexName: string | null, query: AnyObject): unknown | unknown[] {
    if (!indexName) return []
    // Function to extract fields from an index name
    const extractFields = (indexName: string): string[] => {
      return indexName
        .slice(3)
        .split(IndexSeparator)
        .map((field) => field.toLowerCase())
    }

    // Extracting the relevant fields from the index name
    const indexFields = extractFields(indexName)

    // Collecting the values for these fields from the query object
    const keyRangeValue = indexFields.map((field) => query[field as keyof AnyObject])
    return keyRangeValue.length === 1 ? keyRangeValue[0] : keyRangeValue
  }

  private selectBestIndex(query: AnyObject, store: IDBPObjectStore<PayloadStore>): string | null {
    // List of available indexes
    const { indexNames } = store

    // Function to extract fields from an index name
    const extractFields = (indexName: string): string[] => {
      return indexName
        .slice(3)
        .split(IndexSeparator)
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

  /**
   * Checks that the desired DB/Store exists and is initialized
   * @returns The initialized DB or undefined if it does not exist
   */
  private async tryGetInitializedDb(): Promise<IDBPDatabase<PayloadStore> | undefined> {
    // If we've already checked and found a successfully initialized
    // db and objectStore, return the cached value
    if (this._db) return this._db
    // Enumerate the DBs
    const dbs = await indexedDB.databases()
    const dbExists = dbs.some((db) => {
      // Check for the desired name/version
      return db.name === this.dbName && db.version === this.dbVersion
    })
    // If the DB does not exist at the desired version, return undefined
    if (!dbExists) return
    // If the db does exist, open it
    const db = await openDB<PayloadStore>(this.dbName, this.dbVersion)
    // Check that the desired objectStore exists
    const storeExists = db.objectStoreNames.contains(this.storeName)
    // If the correct db/store exists, cache it for future calls
    if (storeExists) this._db = db
    return this._db
  }
}
