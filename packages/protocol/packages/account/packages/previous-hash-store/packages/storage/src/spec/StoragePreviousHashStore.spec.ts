/**
 * @jest-environment jsdom
 */

import { uuid } from '@xyo-network/core'

import { Storage, StoragePreviousHashStore } from '../StoragePreviousHashStore'

describe('StoragePreviousHashStore', () => {
  const previousHash = '2e8de18ece40481f132e6d2f05617e05cd896a9098d28ed65afdf0d72203b490'
  describe('ctor', () => {
    it('with no opts', () => {
      const store = new StoragePreviousHashStore()
      expect(store).toBeInstanceOf(StoragePreviousHashStore)
      expect(store.namespace).toBe(StoragePreviousHashStore.DefaultNamespace)
      expect(store.type).toBe(StoragePreviousHashStore.DefaultStorageType)
    })
    it('with opts', () => {
      const namespace = 'test'
      const type: Storage = 'session'
      const store = new StoragePreviousHashStore({ namespace, type })
      expect(store).toBeInstanceOf(StoragePreviousHashStore)
      expect(store.namespace).toBe(namespace)
      expect(store.type).toBe(type)
    })
  })
  describe('round trip storage', () => {
    it('sets/retrieves an item', async () => {
      const store = new StoragePreviousHashStore()
      const address = uuid()
      await store.setItem(address, previousHash)
      const value = await store.getItem(address)
      expect(value).toBe(previousHash)
    })
  })
  describe('removeItem', () => {
    it('removes an item', async () => {
      const store = new StoragePreviousHashStore()
      const address = uuid()
      await store.setItem(address, previousHash)
      const value = await store.getItem(address)
      expect(value).toBe(previousHash)
      await store.removeItem(address)
      expect(value).toBe(null)
    })
  })
})
