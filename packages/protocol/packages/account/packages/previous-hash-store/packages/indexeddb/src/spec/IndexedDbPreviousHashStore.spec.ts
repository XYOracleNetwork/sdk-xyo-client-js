/**
 * @jest-environment jsdom
 */

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
import { v4 as uuid } from 'uuid'

import { IndexedDbPreviousHashStore } from '../IndexedDbPreviousHashStore'

// Shim via fake-indexeddb
window.indexedDB = indexedDB

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

describe('IndexedDbPreviousHashStore', () => {
  const previousHash = '2e8de18ece40481f132e6d2f05617e05cd896a9098d28ed65afdf0d72203b490'

  describe('ctor', () => {
    it('creates DB/Store with default values', () => {
      const store = new IndexedDbPreviousHashStore()
      expect(store).toBeInstanceOf(IndexedDbPreviousHashStore)
    })
  })
  describe('getItem', () => {
    it('with no value returns null', async () => {
      const store = new IndexedDbPreviousHashStore()
      const address = uuid()
      expect(await store.getItem(address)).toBe(null)
    })
  })
  describe('round trip storage', () => {
    it('sets/retrieves an item', async () => {
      const store = new IndexedDbPreviousHashStore()
      const address = uuid()
      await store.setItem(address, previousHash)
      expect(await store.getItem(address)).toBe(previousHash)
    })
  })
  describe('removeItem', () => {
    it('removes an item', async () => {
      const store = new IndexedDbPreviousHashStore()
      const address = uuid()
      await store.setItem(address, previousHash)
      expect(await store.getItem(address)).toBe(previousHash)
      await store.removeItem(address)
      expect(await store.getItem(address)).toBe(null)
    })
  })
})
