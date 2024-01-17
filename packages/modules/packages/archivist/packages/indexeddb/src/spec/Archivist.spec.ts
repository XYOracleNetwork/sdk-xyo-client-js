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

describe('IndexedDbArchivist', () => {
  const account = Account.randomSync()
  describe('config', () => {
    describe('dbName', () => {
      it('supplied via config uses config value', async () => {
        const dbName = 'testDbName'
        const archivist = await IndexedDbArchivist.create({
          account,
          config: { dbName, schema: IndexedDbArchivistConfigSchema },
        })
        expect(archivist.dbName).toBe(dbName)
      })
      it('not supplied via config uses module name', async () => {
        const name = 'testModuleName'
        const archivist = await IndexedDbArchivist.create({
          account,
          config: { name, schema: IndexedDbArchivistConfigSchema },
        })
        expect(archivist.dbName).toBe(name)
      })
      it('not supplied via config or module name uses default value', async () => {
        const archivist = await IndexedDbArchivist.create({ account, config: { schema: IndexedDbArchivistConfigSchema } })
        expect(archivist.dbName).toBe(IndexedDbArchivist.defaultDbName)
      })
    })
    describe('dbStore', () => {
      it('supplied via config uses config value', async () => {
        const storeName = 'testStoreName'
        const archivist = await IndexedDbArchivist.create({
          account,
          config: { schema: IndexedDbArchivistConfigSchema, storeName },
        })
        expect(archivist.storeName).toBe(storeName)
      })
      it('not supplied via config uses default value', async () => {
        const archivist = await IndexedDbArchivist.create({ account, config: { schema: IndexedDbArchivistConfigSchema } })
        expect(archivist.storeName).toBe(IndexedDbArchivist.defaultStoreName)
      })
      it('allows for multiple dbStores within the same dbName', async () => {
        const dbName = 'testDbName'
        const storeName1 = 'testStoreName1'
        const storeName2 = 'testStoreName2'
        const archivist1 = await IndexedDbArchivist.create({
          account,
          config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName: storeName1 },
        })
        const archivist2 = await IndexedDbArchivist.create({
          account,
          config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName: storeName2 },
        })
        expect(archivist1.storeName).toBe(storeName1)
        expect(archivist2.storeName).toBe(storeName2)
      })
    })
  })
  describe('all', () => {
    const dbName = 'e926a178-9c6a-4604-b65c-d1fccd97f1de'
    const storeName = '27fcea19-c30f-415a-a7f9-0b0514705cb1'
    let sources: Payload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await IndexedDbArchivist.create({
        account,
        config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      sources = await fillDb(archivistModule)
    })
    it('returns all data', async () => {
      const getResult = await archivistModule.all?.()
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(sources.length)
      expect(getResult).toEqual(sources)
    })
  })

  describe('delete', () => {
    const dbName = '6e3fcd65-f24f-4ebc-b314-f597b385fb8e'
    const storeName = 'c0872f52-32b9-415e-8ca9-af78713cee28'
    let sources: Payload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await IndexedDbArchivist.create({
        account,
        config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      sources = await fillDb(archivistModule)
    })
    it('deletes data', async () => {
      const getResult = await archivistModule.all?.()
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(sources.length)
      const hashes = await Promise.all(assertEx(getResult).map((payload) => PayloadWrapper.hashAsync(payload)))
      const deleteResult = await archivistModule.delete?.(hashes)
      expect(deleteResult).toBeArrayOfSize(hashes.length)
      expect(await archivistModule.all?.()).toBeEmpty()
    })
  })
  describe('get', () => {
    const dbName = 'b4379714-73d1-42c6-88e7-1a363b7ed86f'
    const storeName = '3dbdb153-79d0-45d0-b2f7-9f06cdd74b1e'
    let sources: Payload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await IndexedDbArchivist.create({
        account,
        config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
      })
      sources = await fillDb(archivistModule)
    })
    it('gets existing data', async () => {
      for (const source of sources) {
        const sourceHash = await PayloadWrapper.hashAsync(source)
        const getResult = await archivistModule.get([sourceHash])
        expect(getResult).toBeDefined()
        expect(getResult.length).toBe(1)
        const resultHash = await PayloadWrapper.wrap(getResult[0]).hashAsync()
        expect(resultHash).toBe(sourceHash)
      }
    })
    it('returns nothing for non-existing hashes', async () => {
      const hashThatDoesNotExist = '0000000000000000000000000000000000000000000000000000000000000000'
      const getResult = await archivistModule.get([hashThatDoesNotExist])
      expect(getResult).toBeDefined()
      expect(getResult).toBeArrayOfSize(0)
    })
  })
  describe('insert', () => {
    describe('with unique data', () => {
      const dbName = 'bd86d2dd-dc48-4621-8c1f-105ba2e90287'
      const storeName = 'f8d14049-2966-4198-a2ab-1c096a949315'
      let sources: Payload[] = []
      let archivistModule: ArchivistInstance
      beforeAll(async () => {
        archivistModule = await IndexedDbArchivist.create({
          account,
          config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
        })
        sources = await fillDb(archivistModule)
      })
      it('can round trip data', async () => {
        sources = await fillDb(archivistModule)
        for (const source of sources) {
          const sourceHash = await PayloadWrapper.hashAsync(source)
          const getResult = await archivistModule.get([sourceHash])
          expect(getResult).toBeDefined()
          expect(getResult.length).toBe(1)
          const [result] = getResult
          expect(result).toEqual(source)
          const resultHash = await PayloadWrapper.wrap(result).hashAsync()
          expect(resultHash).toBe(sourceHash)
        }
      })
    })
    describe('with duplicate data', () => {
      const dbName = 'bb43b6fe-2f9e-4bda-8177-f94336353f98'
      const storeName = '91c6b87d-3ac8-4cfd-8aee-d509f3de0299'
      let archivistModule: ArchivistInstance
      beforeAll(async () => {
        archivistModule = await IndexedDbArchivist.create({
          account,
          config: { dbName, schema: IndexedDbArchivistConfigSchema, storeName },
        })
      })
      it('handles duplicate insertions', async () => {
        // Insert same payload twice
        const source = { salt: '2d515e1d-d82c-4545-9903-3eded7fefa7c', schema: IdSchema }
        // First insertion should succeed and return the inserted payload
        expect(await archivistModule.insert([source])).toEqual([source])
        // First insertion should succeed but return empty array since no new data was inserted
        expect(await archivistModule.insert([source])).toEqual([])
        // Ensure we can get the inserted payload
        const sourceHash = await PayloadWrapper.hashAsync(source)
        const getResult = await archivistModule.get([sourceHash])
        expect(getResult).toBeDefined()
        expect(getResult.length).toBe(1)
        const resultHash = await PayloadWrapper.wrap(getResult[0]).hashAsync()
        expect(resultHash).toBe(sourceHash)
        // Ensure the DB has all the payloads written to it
        const allResult = await archivistModule.all?.()
        expect(allResult).toBeDefined()
        expect(allResult).toBeArrayOfSize(1)
      })
    })
  })
})
