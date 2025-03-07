import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
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
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { IndexedDbBoundWitnessDiviner } from '../Diviner.ts'

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
 * @group diviner
 */
describe('IndexedDbBoundWitnessDiviner.Errors', () => {
  const dbName = 'testDb'
  const storeName = 'testStore'
  const values: BoundWitness[] = []
  let archivist: IndexedDbArchivist
  describe('divine', () => {
    const createTestNode = async (testDbName = 'INCORRECT-DB-NAME', testStoreName = 'INCORRECT-STORE-NAME') => {
      const sut = await IndexedDbBoundWitnessDiviner.create({
        account: 'random',
        config: {
          archivist: archivist.address,
          dbName: testDbName,
          schema: IndexedDbBoundWitnessDiviner.defaultConfigSchema,
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
    beforeAll(async () => {
      archivist = await IndexedDbArchivist.create({
        account: 'random',
        config: {
          dbName, schema: IndexedDbArchivist.defaultConfigSchema, storeName,
        },
      })
      const [bw] = await new BoundWitnessBuilder().build()
      values.push(bw)
      await archivist.insert(values)
    })
    describe('when DB and store do not exist', () => {
      let sut: IndexedDbBoundWitnessDiviner
      beforeAll(async () => {
        sut = await createTestNode('INCORRECT-DB-NAME', 'INCORRECT-STORE-NAME')
      })
      it('returns empty array', async () => {
        const result = await sut.divine([{ schema: BoundWitnessDivinerQuerySchema }])
        expect(result).toEqual([])
      })
    })
    describe('when DB exists but store does not exist', () => {
      let sut: IndexedDbBoundWitnessDiviner
      beforeAll(async () => {
        sut = await createTestNode(dbName, 'INCORRECT-STORE-NAME')
      })
      it('returns empty array', async () => {
        const result = await sut.divine([{ schema: BoundWitnessDivinerQuerySchema }])
        expect(result).toEqual([])
      })
    })
    describe('when DB and store exist', () => {
      let sut: IndexedDbBoundWitnessDiviner
      beforeAll(async () => {
        sut = await createTestNode(dbName, storeName)
      })
      it('returns values', async () => {
        const result = await sut.divine([{ schema: BoundWitnessDivinerQuerySchema }])
        const filtered = PayloadBuilder.omitStorageMeta(result)
        expect(filtered).toEqual(values)
      })
    })
  })
})
