import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { IndexSeparator } from '@xyo-network/archivist-model'
import { BoundWitness, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { isBoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { IDBPDatabase, IDBPObjectStore, openDB } from 'idb'

import { IndexedDbBoundWitnessDivinerConfigSchema } from './Config'
import { IndexedDbBoundWitnessDivinerParams } from './Params'

interface BoundWitnessStore {
  [s: string]: BoundWitness
}

type ValueFilter = (bw?: BoundWitness | null) => boolean

const bwValueFilter = (
  key: keyof Pick<BoundWitness, 'addresses' | 'payload_hashes' | 'payload_schemas'>,
  values?: string[],
): ValueFilter | undefined => {
  if (!values || values?.length === 0) return undefined
  return (bw) => {
    if (!bw) return false
    return containsAll(bw[key], values)
  }
}

export class IndexedDbBoundWitnessDiviner<
  TParams extends IndexedDbBoundWitnessDivinerParams = IndexedDbBoundWitnessDivinerParams,
> extends BoundWitnessDiviner<TParams> {
  static override configSchemas = [IndexedDbBoundWitnessDivinerConfigSchema]
  static defaultDbName = 'archivist'
  static defaultDbVersion = 1
  static defaultStoreName = 'payloads'

  private _db: IDBPDatabase<BoundWitnessStore> | undefined

  /**
   * The database name. If not supplied via config it defaults to
   * `archivist`. This behavior biases towards a single, isolated
   * DB per archivist which seems to make the most sense for 99% of
   * use cases.
   */
  get dbName() {
    return this.config?.dbName ?? IndexedDbBoundWitnessDiviner.defaultDbName
  }

  /**
   * The database version. If not supplied via config, it defaults to 1.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbBoundWitnessDiviner.defaultDbVersion
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
    return this.config?.storeName ?? IndexedDbBoundWitnessDiviner.defaultStoreName
  }

  private get db(): IDBPDatabase<BoundWitnessStore> {
    return assertEx(this._db, 'DB not initialized')
  }
  protected override async divineHandler(payloads?: Payload[]): Promise<BoundWitness[]> {
    const query = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addresses, payload_hashes, payload_schemas, limit, offset, order } = query
    const tx = this.db.transaction(this.storeName, 'readonly')
    const store = tx.objectStore(this.storeName)
    const results: BoundWitness[] = []
    let parsedOffset = offset ?? 0
    const parsedLimit = limit ?? 10
    const direction: IDBCursorDirection = order === 'desc' ? 'prev' : 'next'
    const valueFilters: ValueFilter[] = [
      bwValueFilter('addresses', addresses),
      bwValueFilter('payload_hashes', payload_hashes),
      bwValueFilter('payload_schemas', payload_schemas),
    ].filter(exists)
    // Only iterate over BWs
    let cursor = await store.index('IX-schema').openCursor(IDBKeyRange.only(BoundWitnessSchema), direction)

    // If we're filtering on more than just the schema, we need to
    // iterate through all the results
    if (valueFilters.length === 0) {
      // Skip records until the offset is reached
      while (cursor && parsedOffset > 0) {
        cursor = await cursor.advance(parsedOffset)
        parsedOffset = 0 // Reset offset after skipping
      }
    }
    // Collect results up to the limit
    while (cursor && results.length < parsedLimit) {
      const bw = cursor.value
      if (bw) {
        // If we're filtering on more than just the schema
        if (valueFilters.length > 0) {
          // Ensure all filters pass
          if (valueFilters.every((filter) => filter(bw))) {
            // Then save the value
            results.push(bw)
          }
        } else {
          // Otherwise just save the value
          results.push(bw)
        }
      }
      cursor = await cursor.continue()
    }
    await tx.done
    // Remove any metadata before returning to the client
    return results.filter(isBoundWitness).map((bw) => {
      return { ...PayloadHasher.jsonPayload(bw), _signatures: bw._signatures }
    })
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    this._db = await openDB<BoundWitnessStore>(this.dbName, this.dbVersion)
    return true
  }

  private getIndexRangeValue(indexName: string | null, query: AnyObject): unknown | unknown[] {
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

  private selectBestIndex(query: AnyObject, store: IDBPObjectStore<BoundWitnessStore>): string | null {
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
}
