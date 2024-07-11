/**
 * @jest-environment jsdom
 */

import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
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

import { IndexedDbPayloadDiviner } from '../Diviner.js'

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
describe('IndexedDbPayloadDiviner.Errors', () => {
  const dbName = 'testDb-IndexedDbPayloadDiviner.Errors'
  const storeName = 'testStore-IndexedDbPayloadDiviner.Errors'
  let sut: IndexedDbPayloadDiviner
  const values = [
    {
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
    },
  ]
  describe('divine', () => {
    const createTestNode = async (testDbName = 'INCORRECT-DB-NAME', testStoreName = 'INCORRECT-STORE-NAME') => {
      const archivist = await IndexedDbArchivist.create({
        account: 'random',
        config: { dbName, schema: IndexedDbArchivist.defaultConfigSchema, storeName },
      })
      await archivist.clear?.()
      await archivist.insert(values)
      const sut = await IndexedDbPayloadDiviner.create({
        account: 'random',
        config: {
          archivist: archivist.address,
          dbName: testDbName,
          schema: IndexedDbPayloadDiviner.defaultConfigSchema,
          storeName: testStoreName,
        },
      })
      const node = await MemoryNode.create({
        account: 'random',
        config: { schema: MemoryNode.defaultConfigSchema },
      })
      const modules = [archivist, sut]
      await node.start()
      await Promise.all(
        modules.map(async (mod) => {
          await node.register(mod)
          await node.attach(mod.address, true)
        }),
      )
      return sut
    }
    describe('when DB and store do not exist', () => {
      beforeAll(async () => {
        sut = await createTestNode('INCORRECT-DB-NAME', 'INCORRECT-STORE-NAME')
      })
      it('returns empty array', async () => {
        const result = await sut.divine([{ schema: PayloadDivinerQuerySchema }])
        expect(result).toEqual([])
      })
    })
    describe('when DB exists but store does not exist', () => {
      beforeAll(async () => {
        sut = await createTestNode(dbName, 'INCORRECT-STORE-NAME')
      })
      it('returns empty array', async () => {
        const result = await sut.divine([{ schema: PayloadDivinerQuerySchema }])
        expect(result).toEqual([])
      })
    })
    describe('when DB and store exist', () => {
      beforeAll(async () => {
        sut = await createTestNode(dbName, storeName)
      })
      it('returns values', async () => {
        const result = await sut.divine([{ schema: PayloadDivinerQuerySchema }])
        expect(PayloadBuilder.withoutMeta(result)).toMatchObject(
          PayloadBuilder.withoutMeta(await Promise.all(values.map((value) => PayloadBuilder.build(value)))),
        )
      })
    })
  })
})
