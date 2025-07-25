import { type Address, asHash } from '@xylabs/hex'
import { v4 as uuid } from 'uuid'
import {
  describe, expect, it,
} from 'vitest'

import type { Storage } from '../StoragePreviousHashStore.ts'
import { StoragePreviousHashStore } from '../StoragePreviousHashStore.ts'

describe('StoragePreviousHashStore', () => {
  const previousHash = asHash('2e8de18ece40481f132e6d2f05617e05cd896a9098d28ed65afdf0d72203b490', true)
  const storageTypesRecord: Record<Storage, boolean> = {
    local: true,
    page: true,
    session: true,
  }
  const StorageTypes: Storage[] = Object.keys(storageTypesRecord) as Storage[]

  describe('ctor', () => {
    it('with no opts uses default values', () => {
      const store = new StoragePreviousHashStore()
      expect(store).toBeInstanceOf(StoragePreviousHashStore)
      expect(store.namespace).toBe(StoragePreviousHashStore.DefaultNamespace)
      expect(store.type).toBe(StoragePreviousHashStore.DefaultStorageType)
    })
    it('with opts uses opt values', () => {
      const namespace = 'test'
      const type: Storage = 'session'
      const store = new StoragePreviousHashStore({ namespace, type })
      expect(store).toBeInstanceOf(StoragePreviousHashStore)
      expect(store.namespace).toBe(namespace)
      expect(store.type).toBe(type)
    })
  })
  describe.each(StorageTypes)('%s', (_storageType: Storage) => {
    describe('getItem', () => {
      it('with no value returns null', async () => {
        const store = new StoragePreviousHashStore()
        const address = uuid().toLowerCase() as Address
        expect(await store.getItem(address)).toBe(null)
      })
    })
    describe('round trip storage', () => {
      it('sets/retrieves an item', async () => {
        const store = new StoragePreviousHashStore()
        const address = uuid().toLowerCase() as Address
        await store.setItem(address, previousHash)
        expect(await store.getItem(address)).toBe(previousHash)
      })
    })
    describe('removeItem', () => {
      it('removes an item', async () => {
        const store = new StoragePreviousHashStore()
        const address = uuid().toLowerCase() as Address
        await store.setItem(address, previousHash)
        expect(await store.getItem(address)).toBe(previousHash)
        await store.removeItem(address)
        expect(await store.getItem(address)).toBe(null)
      })
    })
  })
})
