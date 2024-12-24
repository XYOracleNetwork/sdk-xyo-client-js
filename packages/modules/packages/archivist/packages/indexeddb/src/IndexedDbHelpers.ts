import type { Logger } from '@xylabs/logger'
import type { IndexDescription, IndexDirection } from '@xyo-network/archivist-model'
import { buildStandardIndexName } from '@xyo-network/archivist-model'
import type { IDBPDatabase, IDBPObjectStore } from 'idb'
import { openDB } from 'idb'

import type { PayloadStore } from './Archivist.ts'

export function createStore(db: IDBPDatabase<PayloadStore>, storeName: string, indexes: IndexDescription[], logger?: Logger) {
  logger?.log(`Creating store ${storeName}`)
  // Create the store
  const store = db.createObjectStore(storeName, {
    // If it isn't explicitly set, create a value by auto incrementing.
    autoIncrement: true,
  })
  // Name the store
  store.name = storeName
  // Create an index on the hash
  for (const {
    key, multiEntry, unique,
  } of indexes) {
    const indexKeys = Object.keys(key)
    const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
    const indexName = buildStandardIndexName({ key, unique })
    store.createIndex(indexName, keys, { multiEntry, unique })
  }
}

export async function getExistingIndexes(db: IDBPDatabase<PayloadStore>, storeName: string): Promise<IndexDescription[]> {
  return await useReadOnlyStore(db, storeName, (store) => {
    return [...store.indexNames].map((indexName) => {
      const index = store.index(indexName)
      const key: Record<string, IndexDirection> = {}
      if (Array.isArray(index.keyPath)) {
        for (const keyPath of index.keyPath) {
          key[keyPath] = 1
        }
      } else {
        key[index.keyPath] = 1
      }
      const desc: IndexDescription = {
        name: indexName,
        key,
        unique: index.unique,
        multiEntry: index.multiEntry,
      }
      return desc
    })
  })
}

export async function useDb<T>(dbName: string, callback: (db: IDBPDatabase<PayloadStore>) => Promise<T> | T): Promise<T> {
  const db = await openDB<PayloadStore>(dbName)
  try {
    return await callback(db)
  } finally {
    db.close()
  }
}

export async function useReadOnlyStore<T>(
  db: IDBPDatabase<PayloadStore>,
  storeName: string,
  callback: (store: IDBPObjectStore<PayloadStore, [string], string, 'readonly'>) => Promise<T> | T,
): Promise<T> {
  const transaction = db.transaction(storeName, 'readonly')
  const store = transaction.objectStore(storeName)
  try {
    return await callback(store)
  } finally {
    await transaction.done
  }
}

export async function useReadWriteStore<T>(
  db: IDBPDatabase<PayloadStore>,
  storeName: string,
  callback: (store: IDBPObjectStore<PayloadStore, [string], string, 'readwrite'>) => Promise<T> | T,
): Promise<T> {
  const transaction = db.transaction(storeName, 'readwrite')
  const store = transaction.objectStore(storeName)
  try {
    return await callback(store)
  } finally {
    await transaction.done
  }
}
