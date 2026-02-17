import type { Address } from '@xylabs/sdk-js'
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
import {
  describe, expect, it,
} from 'vitest'

import { IndexedDbPreviousHashStore } from '../IndexedDbPreviousHashStore.ts'

// Shim via fake-indexeddb
globalThis.indexedDB = indexedDB

// Augment window with prototypes to ensure instance of comparisons work
globalThis.IDBCursor = IDBCursor
globalThis.IDBCursorWithValue = IDBCursorWithValue
globalThis.IDBDatabase = IDBDatabase
globalThis.IDBFactory = IDBFactory
globalThis.IDBIndex = IDBIndex
globalThis.IDBKeyRange = IDBKeyRange
globalThis.IDBObjectStore = IDBObjectStore
globalThis.IDBOpenDBRequest = IDBOpenDBRequest
globalThis.IDBRequest = IDBRequest
globalThis.IDBTransaction = IDBTransaction
globalThis.IDBVersionChangeEvent = IDBVersionChangeEvent

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
      const address = uuid().toLowerCase() as Address
      expect(await store.getItem(address)).toBe(null)
    })
  })
  describe('round trip storage', () => {
    it('sets/retrieves an item', async () => {
      const store = new IndexedDbPreviousHashStore()
      const address = uuid().toLowerCase() as Address
      await store.setItem(address, previousHash)
      expect(await store.getItem(address)).toBe(previousHash)
    })
  })
  describe('removeItem', () => {
    it('removes an item', async () => {
      const store = new IndexedDbPreviousHashStore()
      const address = uuid().toLowerCase() as Address
      await store.setItem(address, previousHash)
      expect(await store.getItem(address)).toBe(previousHash)
      await store.removeItem(address)
      expect(await store.getItem(address)).toBe(null)
    })
  })
})
