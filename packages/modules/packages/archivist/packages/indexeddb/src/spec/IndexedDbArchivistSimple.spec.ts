/**
 * @jest-environment jsdom
 */
import { Account } from '@xyo-network/account'
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
} from 'fake-indexeddb'

import { IndexedDbArchivistSimple, IndexedDbArchivistSimpleConfigSchema } from '../IndexedDbArchivistSimple'
import { testArchivistAll, testArchivistClear, testArchivistDelete, testArchivistRoundTrip } from './testArchivist'

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

// Shim via fake-indexeddb
const freshInstance = new IDBFactory()
window.indexedDB = freshInstance

describe('IndexedDbArchivistSimple', () => {
  const account = Account.randomSync()
  describe('With dbName', () => {
    it('supplied via config uses config value', async () => {
      const dbName = 'testDbName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(dbName)
    })
    it('not supplied via config uses module name', async () => {
      const name = 'testModuleName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { name, schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(name)
    })
    it('not supplied via config or module name uses default value', async () => {
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(IndexedDbArchivistSimple.defaultDbName)
    })
  })
  describe('With dbStore', () => {
    it('supplied via config uses config value', async () => {
      const storeName = 'testStoreName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema, storeName } })
      expect(archivist.storeName).toBe(storeName)
    })
    it('not supplied via config uses default value', async () => {
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.storeName).toBe(IndexedDbArchivistSimple.defaultStoreName)
    })
  })

  describe('Using IndexedDB from window', () => {
    const name = 'IndexedDB (window)'
    const dbName = 'IndexedDbArchivistSimple'
    testArchivistAll(IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } }), name)
    testArchivistClear(IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } }), name)
    testArchivistDelete(IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } }), name)
    testArchivistRoundTrip(IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } }), name)
  })
})
