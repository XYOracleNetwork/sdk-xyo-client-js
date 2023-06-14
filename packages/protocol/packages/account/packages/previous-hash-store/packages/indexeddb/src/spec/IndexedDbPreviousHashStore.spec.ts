/**
 * @jest-environment jsdom
 */

import { uuid } from '@xyo-network/core'
import { indexedDB } from 'fake-indexeddb'

import { IndexedDbPreviousHashStore } from '../IndexedDbPreviousHashStore'

window.indexedDB = indexedDB

describe('IndexedDbPreviousHashStore', () => {
  const previousHash = '2e8de18ece40481f132e6d2f05617e05cd896a9098d28ed65afdf0d72203b490'

  describe('ctor', () => {
    it('with no opts uses default values', () => {
      const store = new IndexedDbPreviousHashStore()
      expect(store).toBeInstanceOf(IndexedDbPreviousHashStore)
      expect(store.dbName).toBe(IndexedDbPreviousHashStore.DefaultDbName)
      expect(store.storeName).toBe(IndexedDbPreviousHashStore.DefaultStoreName)
    })
    it('with opts uses opt values', () => {
      const dbName = 'test'
      const storeName = 'session'
      const store = new IndexedDbPreviousHashStore({ dbName, storeName })
      expect(store).toBeInstanceOf(IndexedDbPreviousHashStore)
      expect(store.dbName).toBe(dbName)
      expect(store.storeName).toBe(storeName)
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
