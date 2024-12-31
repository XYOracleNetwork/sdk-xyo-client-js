import { exists } from '@xylabs/exists'
import type { IndexDescription, ObjectStore } from '@xylabs/indexed-db'
import {
  buildStandardIndexName,
  createStore,
  getExistingIndexes,
  withDb,
} from '@xylabs/indexed-db'
import type { Logger } from '@xylabs/logger'
import type { IDBPDatabase } from 'idb'
import { openDB } from 'idb'

export async function checkNeedsUpgrade(dbName: string, storeName: string, indexes: IndexDescription[]) {
  return await withDb<ObjectStore, [number | null, IndexDescription[]]>(dbName, async (db) => {
    const existingIndexes = await getExistingIndexes(db, storeName)
    const existingIndexNames = new Set(existingIndexes.map(({ name }) => name).filter(exists))
    for (const { key, unique } of indexes) {
      const indexName = buildStandardIndexName({ key, unique })
      if (!existingIndexNames.has(indexName)) {
        return [db.version + 1, existingIndexes]
      }
    }
    return [null, []]
  })
}

export async function addMissingIndexes(dbName: string, storeName: string, indexes: IndexDescription[], logger?: Logger): Promise<void> {
  const [versionNeeded, existingIndexes] = await checkNeedsUpgrade(dbName, storeName, indexes)
  if (versionNeeded === null) {
    // indexes are up to date
    return
  }
  let db: IDBPDatabase<ObjectStore> | undefined = undefined
  try {
    db = await openDB(dbName, versionNeeded, {
      blocked(currentVersion, blockedVersion, event) {
        logger?.warn(`IndexedDbArchivist: Blocked from upgrading from ${currentVersion} to ${blockedVersion}`, event)
      },
      blocking(currentVersion, blockedVersion, event) {
        logger?.warn(`IndexedDbArchivist: Blocking upgrade from ${currentVersion} to ${blockedVersion}`, event)
      },
      terminated() {
        logger?.log('IndexedDbArchivist: Terminated')
      },
      upgrade(db: IDBPDatabase<ObjectStore<object>>, oldVersion, newVersion, transaction) {
      // NOTE: This is called whenever the DB is created/updated. We could simply ensure the desired end
      // state but, out of an abundance of caution, we will just delete (so we know where we are starting
      // from a known good point) and recreate the desired state. This prioritizes resilience over data
      // retention but we can revisit that tradeoff when it becomes limiting. Because distributed browser
      // state is extremely hard to debug, this seems like fair tradeoff for now.
        if (oldVersion !== newVersion) {
          logger?.log(`IndexedDbArchivist: Upgrading from ${oldVersion} to ${newVersion}`)
          // Delete any existing databases that are not the current version
          const objectStores = transaction.objectStoreNames
          for (const name of objectStores) {
            try {
              db.deleteObjectStore(name)
            } catch {
              logger?.log(`IndexedDbArchivist: Failed to delete existing object store ${name}`)
            }
          }
        }

        // keep any indexes that were there before but are not required by this config
        // we do this incase there are two or more configs trying to use the db and they have mismatched indexes, so they do not erase each other's indexes
        const existingIndexesToKeep = existingIndexes.filter(({ name: existingName }) => !indexes.some(({ name }) => name === existingName))
        console.log('existingIndexes', existingIndexes)
        console.log('existingIndexesToKeep', existingIndexesToKeep)
        console.log('indexes', indexes)
        const indexesToCreate = indexes.map(idx => ({
          ...idx,
          name: buildStandardIndexName(idx),
        // eslint-disable-next-line unicorn/no-array-reduce
        })).reduce((acc, idx) => acc.set(idx.name, idx), new Map<string, IndexDescription>()).values()
        createStore(db, storeName, [...indexesToCreate], logger)
      },
    })
  } finally {
    db?.close()
  }
}
