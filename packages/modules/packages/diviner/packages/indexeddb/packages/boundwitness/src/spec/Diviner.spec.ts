/**
 * @jest-environment jsdom
 */
/* eslint-disable max-nested-callbacks */
import { Account } from '@xyo-network/account'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
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

import { IndexedDbBoundWitnessDiviner } from '../Diviner'

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
  const dbName = 'testDb'
  const storeName = 'testStore'
  let archivist: IndexedDbArchivist
  let sut: IndexedDbBoundWitnessDiviner
  let node: MemoryNode
  const payloadA = {
    schema: 'network.xyo.test',
    url: 'https://xyo.network',
  }
  const payloadB = {
    foo: ['bar', 'baz'],
    schema: 'network.xyo.debug',
  }
  const payloads = [payloadA, payloadB]
  const boundWitnesses: BoundWitness[] = []
  beforeAll(async () => {
    const [boundWitnessA] = await new BoundWitnessBuilder().payloads([payloadA]).build()
    const [boundWitnessB] = await new BoundWitnessBuilder().payloads([payloadB]).build()
    boundWitnesses.push(boundWitnessA, boundWitnessB)
    archivist = await IndexedDbArchivist.create({
      account: Account.randomSync(),
      config: { dbName, schema: IndexedDbArchivist.configSchema, storeName },
    })
    await archivist.insert(boundWitnesses)
    sut = await IndexedDbBoundWitnessDiviner.create({
      account: Account.randomSync(),
      config: {
        archivist: archivist.address,
        dbName,
        schema: IndexedDbBoundWitnessDiviner.configSchema,
        storeName,
      },
    })
    node = await MemoryNode.create({
      account: Account.randomSync(),
      config: { schema: MemoryNode.configSchema },
    })
    const modules = [archivist, sut]
    await node.start()
    await Promise.all(
      modules.map(async (mod) => {
        await node.register(mod)
        await node.attach(mod.address, true)
      }),
    )
  })
  describe('with filter for', () => {
    describe('schema', () => {
      describe('single', () => {
        it.each(['network.xyo.test', 'network.xyo.debug'])('only returns payloads of that schema', async (schema) => {
          const payload_schemas = [schema]
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => result.schema === schema)).toBe(true)
        })
      })
      describe.skip('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const payload_schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => payload_schemas.includes(result.schema))).toBe(true)
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        it('only returns payloads with that property', async () => {
          type WithUrl = { url?: string }
          const url = payloadA.url
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload & WithUrl>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ url })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => (result as WithUrl)?.url === url)).toBe(true)
        })
      })
      describe.skip('array', () => {
        const cases: string[][] = [['bar'], ['baz'], ['bar', 'baz']]
        it.each(cases)('only returns payloads that have an array containing all the values supplied', async (...foo) => {
          type WithFoo = { foo?: string[] }
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload & WithFoo>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ foo })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => foo.every((v) => (result as unknown as WithFoo)?.foo?.includes(v)))).toBe(true)
        })
      })
    })
  })
  describe('with order', () => {
    describe('not set', () => {
      it('returns payloads in ascending order', async () => {
        const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(boundWitnesses)
      })
    })
    describe('asc', () => {
      it('returns payloads in ascending order', async () => {
        const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
          .fields({ order: 'asc' })
          .build()
        const results = await sut.divine([query])
        expect(results).toEqual(boundWitnesses)
      })
    })
    describe('desc', () => {
      it('returns payloads in descending order', async () => {
        const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
          .fields({ order: 'desc' })
          .build()
        const results = await sut.divine([query])
        expect(results).toEqual([...boundWitnesses].reverse())
      })
    })
  })
})
