/**
 * @jest-environment jsdom
 */

import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness, isBoundWitnessWithMeta } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { WithMeta } from '@xyo-network/payload-model'
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

import { IndexedDbBoundWitnessDiviner } from '../Diviner.ts'

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
  const boundWitnesses: WithMeta<BoundWitness>[] = []
  beforeAll(async () => {
    const [boundWitnessA] = await (await new BoundWitnessBuilder().payloads([payloadA])).build()
    const [boundWitnessB] = await (await new BoundWitnessBuilder().payloads([payloadB])).build()
    const [boundWitnessC] = await (await new BoundWitnessBuilder().payloads([payloadA, payloadB])).build()
    boundWitnesses.push(boundWitnessA, boundWitnessB, boundWitnessC)
    archivist = await IndexedDbArchivist.create({
      account: 'random',
      config: { dbName, schema: IndexedDbArchivist.defaultConfigSchema, storeName },
    })
    await archivist.insert(boundWitnesses)
    sut = await IndexedDbBoundWitnessDiviner.create({
      account: 'random',
      config: {
        archivist: archivist.address,
        dbName,
        schema: IndexedDbBoundWitnessDiviner.defaultConfigSchema,
        storeName,
      },
    })
    node = await MemoryNode.create({
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
  })
  describe('with filter for', () => {
    describe('payload_schemas', () => {
      describe('single', () => {
        it.each(['network.xyo.test', 'network.xyo.debug'])(
          'returns only bound witnesses with payload_schemas that contain the schema',
          async (schema) => {
            const payload_schemas = [schema]
            const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
              .fields({ payload_schemas })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            const bws = results.filter(isBoundWitnessWithMeta)
            expect(bws.length).toBeGreaterThan(0)
            for (const bw of bws) {
              expect(bw.payload_schemas).toIncludeAllMembers(payload_schemas)
            }
          },
        )
      })
      describe('multiple', () => {
        it.each([
          ['network.xyo.test', 'network.xyo.debug'],
          ['network.xyo.test', 'network.xyo.debug'],
        ])('returns only bound witnesses with payload_schemas that contain the all the schemas', async (...payload_schemas) => {
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          const bws = results.filter(isBoundWitnessWithMeta)
          expect(bws.length).toBeGreaterThan(0)
          for (const bw of bws) {
            expect(bw.payload_schemas).toIncludeAllMembers(payload_schemas)
          }
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
  describe('with offset', () => {
    describe('when ascending order', () => {
      it('returns payloads from the beginning', async () => {
        for (const [i, boundWitness] of boundWitnesses.entries()) {
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ limit: 1, offset: i, order: 'asc' })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(PayloadBuilder.withoutMeta(result)).toEqual(PayloadBuilder.withoutMeta(boundWitness))
        }
      })
    })
    describe('when descending order', () => {
      it('returns payloads from the end', async () => {
        for (let i = 0; i < boundWitnesses.length; i++) {
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ limit: 1, offset: i, order: 'desc' })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(PayloadBuilder.withoutMeta(result)).toEqual(PayloadBuilder.withoutMeta(boundWitnesses[boundWitnesses.length - i - 1]))
        }
      })
    })
  })
})
