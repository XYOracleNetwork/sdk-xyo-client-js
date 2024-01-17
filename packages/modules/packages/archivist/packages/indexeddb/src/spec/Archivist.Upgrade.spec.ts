/**
 * @jest-environment jsdom
 */
import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBOpenDBRequest,
  IDBRequest,
  IDBTransaction,
  IDBVersionChangeEvent,
  indexedDB,
} from 'fake-indexeddb'

import { IndexedDbArchivist } from '../Archivist'
import { IndexedDbArchivistConfigSchema } from '../Config'

// Augment window with prototypes to ensure instance of comparisons work
window.IDBCursor = IDBCursor
window.IDBCursorWithValue = IDBCursorWithValue
window.IDBDatabase = IDBDatabase
window.IDBFactory = IDBFactory
window.IDBIndex = IDBIndex
window.IDBKeyRange = IDBKeyRange
window.IDBObjectStore = IDBObjectStore
window.IDBOpenDBRequest = IDBOpenDBRequest
window.IDBRequest = IDBRequest
window.IDBTransaction = IDBTransaction
window.IDBVersionChangeEvent = IDBVersionChangeEvent
window.indexedDB = indexedDB

/**
 * @group module
 * @group archivist
 */

const fillDb = async (db: ArchivistInstance, count: number = 10) => {
  const sources = Array.from({ length: count }).map((_, i) => {
    return { salt: `${i}`, schema: IdSchema }
  })
  for (const source of sources) {
    await db.insert([source])
  }
  return sources
}

describe('IndexedDbArchivist.Upgrade', () => {
  const account = Account.randomSync()

  describe('with newer version', () => {
    const dbName = 'b4379714-73d1-42c6-88e7-1a363b7ed86f'
    const storeName = '3dbdb153-79d0-45d0-b2f7-9f06cdd74b1e'
    const dbVersion = 2
    let sources: Payload[] = []
    let archivistModule: IndexedDbArchivist
    beforeAll(async () => {
      archivistModule = await IndexedDbArchivist.create({
        account,
        config: { dbName, dbVersion, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      sources = await fillDb(archivistModule)
    })
    it('handles upgrade', async () => {
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(dbVersion)
      const all = await archivistModule?.all?.()
      expect(all?.length).toBe(sources.length)
      const upgradedDbVersion = dbVersion + 1
      archivistModule = await IndexedDbArchivist.create({
        account,
        config: { dbName, dbVersion: upgradedDbVersion, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(upgradedDbVersion)
    })
  })
})
