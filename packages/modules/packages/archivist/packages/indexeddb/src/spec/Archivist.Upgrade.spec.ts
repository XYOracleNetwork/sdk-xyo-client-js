/**
 * @jest-environment jsdom
 */
import type { AccountInstance } from '@xyo-network/account'
import { Account } from '@xyo-network/account'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
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
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { IndexedDbArchivist } from '../Archivist.ts'
import type { IndexedDbArchivistConfig } from '../Config.ts'
import { IndexedDbArchivistConfigSchema } from '../Config.ts'

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
globalThis.indexedDB = indexedDB

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
  let account: AccountInstance
  type UpgradeTestData = [oldVersion: number | undefined, newVersion: number | undefined, dbName: string, storeName: string]

  beforeAll(async () => {
    account = await Account.random()
  })

  describe('with same version specified', () => {
    const cases: UpgradeTestData[] = [
      [undefined, undefined, '4db66c75-bb44-4a80-a846-6e2b142271a2', '4ab1aaa8-c64d-4b31-af94-01a60e27c33c'],
      [undefined, 1, 'c2fad8ae-c11a-4136-8634-1f080ddc485f', '16eb2cf0-eedb-4802-bd51-eb228735ab25'],
      [1, 1, '125f20d6-410a-4c3b-b66a-ffaefe501e63', '16a755bf-5baa-480d-839b-f5adfaec6d7a'],
      [2, 2, '9a688c8d-18a2-4093-a107-560aafd5d256', '569ccb65-96ee-4b5d-ad20-d8556bb0b72b'],
    ]
    it.each(cases)('handles reopening', async (oldVersion, newVersion, dbName, storeName) => {
      const oldConfig: IndexedDbArchivistConfig = {
        dbName, schema: IndexedDbArchivistConfigSchema, storeName,
      }
      if (oldVersion) oldConfig.dbVersion = oldVersion
      let archivistModule = await IndexedDbArchivist.create({ account, config: oldConfig })
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(oldVersion ?? 1)
      const payloads = await fillDb(archivistModule)
      let all = await archivistModule?.all?.()
      expect(all?.length).toBe(payloads.length)
      const newConfig: IndexedDbArchivistConfig = {
        dbName, schema: IndexedDbArchivistConfigSchema, storeName,
      }
      if (newVersion) newConfig.dbVersion = newVersion
      archivistModule = await IndexedDbArchivist.create({ account, config: newConfig })
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(newVersion ?? 1)
      all = await archivistModule?.all?.()
      expect(all?.length).toBe(10)
    })
  })
  describe('with newer version specified', () => {
    const cases: UpgradeTestData[] = [
      [1, 2, '5e75de01-4b3b-416b-b1bc-4b9686cc4119', '72207e1f-5b50-4b53-a03a-21636d241599'],
      [2, 3, 'e371f396-0c5b-42ff-9472-04282afdef10', '5ce3bc2e-49ac-45c1-8fce-ab68961d327d'],
    ]
    it.each(cases)('handles upgrade', async (oldVersion, newVersion, dbName, storeName) => {
      const oldConfig: IndexedDbArchivistConfig = {
        dbName, schema: IndexedDbArchivistConfigSchema, storeName,
      }
      if (oldVersion) oldConfig.dbVersion = oldVersion
      let archivistModule = await IndexedDbArchivist.create({ account, config: oldConfig })
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(oldVersion ?? 1)
      const payloads = await fillDb(archivistModule)
      let all = await archivistModule?.all?.()
      expect(all?.length).toBe(payloads.length)
      const newConfig: IndexedDbArchivistConfig = {
        dbName, schema: IndexedDbArchivistConfigSchema, storeName,
      }
      if (newVersion) newConfig.dbVersion = newVersion
      archivistModule = await IndexedDbArchivist.create({ account, config: newConfig })
      expect(archivistModule).toBeDefined()
      expect(archivistModule?.dbVersion).toBe(newVersion ?? 1)
      all = await archivistModule?.all?.()
      expect(all?.length).toBe(0)
    })
  })
})
