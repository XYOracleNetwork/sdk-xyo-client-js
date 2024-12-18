import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { type BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { isBoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import type {
  Schema, Sequence, WithStorageMeta,
} from '@xyo-network/payload-model'
import type { IDBPCursorWithValue, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

import { IndexedDbBoundWitnessDivinerConfigSchema } from './Config.ts'
import type { IndexedDbBoundWitnessDivinerParams } from './Params.ts'

interface BoundWitnessStore {
  [s: string]: WithStorageMeta<BoundWitness>
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
  TIn extends BoundWitnessDivinerQueryPayload = BoundWitnessDivinerQueryPayload,
  TOut extends BoundWitness = BoundWitness,
> extends BoundWitnessDiviner<TParams, TIn, TOut> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, IndexedDbBoundWitnessDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = IndexedDbBoundWitnessDivinerConfigSchema

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
    const query = payloads?.find(isBoundWitnessDivinerQueryPayload)
    if (!query) return []
    const result = await this.tryUseDb(async (db) => {
      const {
        addresses, payload_hashes, payload_schemas, limit, cursor, order,
      } = query
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const results: TOut[] = []
      const parsedCursor = cursor
      const parsedLimit = limit ?? 10
      const valueFilters: ValueFilter[] = [
        isBoundWitness,
        bwValueFilter('addresses', addresses),
        bwValueFilter('payload_hashes', payload_hashes),
        bwValueFilter('payload_schemas', payload_schemas),
      ].filter(exists)
      const direction: IDBCursorDirection = order === 'desc' ? 'prev' : 'next'

      // Iterate all records using the sequence index
      const sequenceIndex = assertEx(store.index(IndexedDbArchivist.sequenceIndexName), () => 'Failed to get sequence index')
      let dbCursor: IDBPCursorWithValue<BoundWitnessStore, [string], string, string, 'readonly'> | null
      = assertEx(await sequenceIndex.openCursor(null, direction), () => `Failed to get cursor [${parsedCursor}, ${cursor}]`)

      // If a cursor was supplied
      if (parsedCursor !== undefined) {
        let currentSequence: Sequence | undefined
        // Skip records until the supplied cursor offset is reached
        while (dbCursor && currentSequence !== parsedCursor) {
          // Find the sequence of the current record
          const current: WithStorageMeta<BoundWitness> = dbCursor.value
          currentSequence = current?._sequence
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
    // NOTE: Do not eager initialize the DB here. It will cause the
    // DB to be created by this process and then the DB will be
    // in a bad state for other processes that need to create the DB.
    return true
  }

  /**
   * Checks that the desired DB/objectStore exists and is initialized to the correct version
   * @returns The initialized DB or undefined if it does not exist in the desired state
   */
  private async tryGetInitializedDb(): Promise<IDBPDatabase<BoundWitnessStore> | undefined> {
    // Enumerate the DBs
    const dbs = await indexedDB.databases()
    // Check that the DB exists at the desired version
    const dbExists = dbs.some((db) => {
      return db.name === this.dbName && db.version === this.dbVersion
    })
    // If the DB exists at the desired version
    if (dbExists) {
      // If the db does exist, open it
      const db = await openDB<BoundWitnessStore>(this.dbName, this.dbVersion)
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
  private async tryUseDb<T>(callback: (db: IDBPDatabase<BoundWitnessStore>) => Promise<T> | T): Promise<T | undefined> {
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
