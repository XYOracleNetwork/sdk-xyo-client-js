/// <reference lib="dom" />

import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { removeFields } from '@xylabs/object'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { isPayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import type {
  AnyPayload,
  Payload, Schema, Sequence,
} from '@xyo-network/payload-model'
import type { IDBPCursorWithValue, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

import { IndexedDbPayloadDivinerConfigSchema } from './Config.ts'
import type { IndexedDbPayloadDivinerParams } from './Params.ts'

interface PayloadStore {
  [s: string]: Payload
}

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
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, IndexedDbPayloadDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = IndexedDbPayloadDivinerConfigSchema

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
    const query = payloads?.find(isPayloadDivinerQueryPayload)
    if (!query) return []
    const result = await this.tryUseDb(async (db) => {
      const {
        schemas, limit, cursor, order, ...props
      } = removeFields(query, ['schema'])
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: TOut[] = []
      let parsedCursor = cursor
      const parsedLimit = limit ?? 10
      assertEx((schemas?.length ?? 1) === 1, () => 'IndexedDbPayloadDiviner: Only one filter schema supported')
      const filterSchema = schemas?.[0]
      const filter = filterSchema ? { schema: filterSchema, ...props } : { ...props }
      const valueFilters: ValueFilter[] = Object.entries(filter)
        .map(([key, value]) => payloadValueFilter(key, value))
        .filter(exists)
      const direction: IDBCursorDirection = order === 'desc' ? 'prev' : 'next'

      // Iterate all records using the sequence index
      const sequenceIndex = assertEx(store.index(IndexedDbArchivist.sequenceIndexName), () => 'Failed to get sequence index')
      let dbCursor: IDBPCursorWithValue<PayloadStore, [string], string, string, 'readonly'> | null
      = await sequenceIndex.openCursor(null, direction)

      // If a cursor was supplied
      if (parsedCursor !== undefined) {
        let currentSequence: Sequence | undefined
        // Skip records until the supplied cursor offset is reached
        while (dbCursor && currentSequence !== parsedCursor) {
          // Find the sequence of the current record
          currentSequence = await dbCursor.value?.sequence
          // Advance one record beyond the cursor
          dbCursor = await dbCursor.advance(1)
        }
      }

      // Collect results up to the limit
      while (dbCursor && results.length < parsedLimit) {
        const value = dbCursor.value
        if (value) {
          // If we're filtering on more than just the schema
          if (valueFilters.length > 0) {
            // Ensure all filters pass
            if (valueFilters.every(filter => filter(value))) {
              // Then save the value
              results.push(value)
            }
          } else {
            // Otherwise just save the value
            results.push(value)
          }
        }
        try {
          dbCursor = await dbCursor.continue()
        } catch {
          break
        }
      }
      await tx.done
      // Remove any metadata before returning to the client
      return results
    })
    return result ?? []
  }

  protected override async startHandler() {
    await super.startHandler()
    return true
  }

  /**
   * Checks that the desired DB/objectStore exists and is initialized to the correct version
   * @returns The initialized DB or undefined if it does not exist in the desired state
   */
  private async tryGetInitializedDb(): Promise<IDBPDatabase<PayloadStore> | undefined> {
    // Enumerate the DBs
    const dbs = await indexedDB.databases()
    // Check that the DB exists
    const dbExists = dbs.some((db) => {
      return db.name === this.dbName
    })
    // If the DB exists
    if (dbExists) {
      // If the db does exist, open it
      const db = await openDB<PayloadStore>(this.dbName)
      // Check that the desired objectStore exists
      const storeExists = db.objectStoreNames.contains(this.storeName)
      // If the correct db/version/objectStore exists
      if (storeExists) {
        return db
      } else {
        // Otherwise close the db so the process that is going to update the
        // db can open it
        db.close()
      }
    }
  }

  /**
   * Executes a callback with the initialized DB and then closes the db
   * @param callback The method to execute with the initialized DB
   * @returns
   */
  private async tryUseDb<T>(callback: (db: IDBPDatabase<PayloadStore>) => Promise<T> | T): Promise<T | undefined> {
    // Get the initialized DB
    const db = await this.tryGetInitializedDb()
    if (db) {
      try {
        // Perform the callback
        return await callback(db)
      } finally {
        // Close the DB
        db.close()
      }
    }
    return undefined
  }
}
