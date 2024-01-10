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
 * @group diviner
 */
describe('IndexedDbBoundWitnessDiviner', () => {
  it('works', () => {
    expect(true).toBe(true)
  })
})
