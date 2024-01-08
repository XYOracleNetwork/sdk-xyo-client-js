/**
 * @jest-environment jsdom
 */
import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
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

describe('IndexedDbArchivist', () => {
  describe('With dbName', () => {
    it('supplied via config uses config value', async () => {
      const dbName = 'testDbName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { dbName, schema: IndexedDbArchivistConfigSchema },
      })
      expect(archivist.dbName).toBe(dbName)
    })
    it('not supplied via config uses module name', async () => {
      const name = 'testModuleName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { name, schema: IndexedDbArchivistConfigSchema },
      })
      expect(archivist.dbName).toBe(name)
    })
    it('not supplied via config or module name uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ account: Account.randomSync(), config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.dbName).toBe(IndexedDbArchivist.defaultDbName)
    })
  })
  describe('With dbStore', () => {
    it('supplied via config uses config value', async () => {
      const storeName = 'testStoreName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { schema: IndexedDbArchivistConfigSchema, storeName },
      })
      expect(archivist.storeName).toBe(storeName)
    })
    it('not supplied via config uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ account: Account.randomSync(), config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.storeName).toBe(IndexedDbArchivist.defaultStoreName)
    })
  })

  describe('Using IndexedDB from window', () => {
    test('Archivist RoundTrip [IndexedDB (window)]', async () => {
      const dbName = '0041ce9d-75fb-491e-8d77-5f201fce3320'
      const storeName = 'b6073168-48c4-4004-8105-699e7f0ab5cd'
      const idPayload: Payload<{ salt: string }> = {
        salt: Date.now().toString(),
        schema: IdSchema,
      }
      const payloadWrapper = PayloadWrapper.wrap(idPayload)
      const archivistModule = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      const insertResult = await archivistModule.insert([idPayload])
      expect(insertResult).toBeDefined()

      const getResult = await archivistModule.get([await payloadWrapper.hashAsync()])
      expect(getResult).toBeDefined()
      expect(getResult.length).toBe(1)
      const gottenPayload = getResult[0]
      if (gottenPayload) {
        const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
        expect(await gottenPayloadWrapper.hashAsync()).toBe(await payloadWrapper.hashAsync())
      }
    })
    test('Archivist All [IndexedDB (window)]', async () => {
      const dbName = 'e7674a1f-20db-4d76-83b9-0d933e35876d'
      const storeName = '35754cad-3fed-4907-b44b-680d4bd9d205'
      const archivistModule = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      const count = 10
      for (let x = 0; x < count; x++) {
        const idPayload = {
          salt: `${x}`,
          schema: IdSchema,
        }
        await archivistModule.insert([idPayload])
        await delay(10)
      }
      const getResult = await archivistModule.all?.()
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(count)
    })
  })
})
