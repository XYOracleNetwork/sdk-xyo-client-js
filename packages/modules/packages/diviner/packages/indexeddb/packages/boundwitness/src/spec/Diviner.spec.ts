import '@xylabs/vitest-extended'

import { filterAs } from '@xylabs/array'
import { delay } from '@xylabs/delay'
import { AsObjectFactory } from '@xylabs/object'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { asBoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isStorageMeta, type WithStorageMeta } from '@xyo-network/payload-model'
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
  beforeAll, describe, expect,
  it,
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

const asStorageMeta = AsObjectFactory.create(isStorageMeta)

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
  const boundWitnesses: WithStorageMeta<BoundWitness>[] = []
  beforeAll(async () => {
    const [boundWitnessA] = await (new BoundWitnessBuilder().payloads([payloadA])).build()
    const [boundWitnessB] = await (new BoundWitnessBuilder().payloads([payloadB])).build()
    const [boundWitnessC] = await (new BoundWitnessBuilder().payloads([payloadA, payloadB])).build()
    archivist = await IndexedDbArchivist.create({
      account: 'random',
      config: {
        dbName, schema: IndexedDbArchivist.defaultConfigSchema, storeName,
      },
    })
    for (const [bw, payloads] of [
      [boundWitnessA, [payloadA]],
      [boundWitnessB, [payloadB]],
      [boundWitnessC, [payloadA, payloadB]],
    ] as const) {
      await delay(2)
      const inserted = await archivist.insert([bw, ...payloads])
      const bwWithStorageMeta = filterAs(filterAs(inserted, asBoundWitness), asStorageMeta) as WithStorageMeta<BoundWitness>[]
      boundWitnesses.push(...bwWithStorageMeta)
    }
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
            const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
              .fields({ payload_schemas })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            const bws = results.filter(isBoundWitness)
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
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          const bws = results.filter(isBoundWitness)
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
        const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(boundWitnesses)
      })
    })
    describe('asc', () => {
      it('returns payloads in ascending order', async () => {
        const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
          .fields({ order: 'asc' })
          .build()
        const results = await sut.divine([query])
        expect(results).toEqual(boundWitnesses)
      })
    })
    describe('desc', () => {
      it('returns payloads in descending order', async () => {
        const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
          .fields({ order: 'desc' })
          .build()
        const results = await sut.divine([query])
        expect(results).toEqual([...boundWitnesses].reverse())
      })
    })
  })
  describe('with cursor', () => {
    describe('when ascending order', () => {
      it('returns payloads from the beginning', async () => {
        const iterator = boundWitnesses.entries()
        iterator.next()
        for (const [i, boundWitness] of iterator) {
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, cursor: boundWitnesses[i - 1]._sequence, order: 'asc',
            })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(PayloadBuilder.omitMeta(result)).toEqual(PayloadBuilder.omitMeta(boundWitness))
        }
      })
    })
    describe('when descending order', () => {
      it('returns payloads from the end', async () => {
        const iterator = [...boundWitnesses.entries()].reverse()[Symbol.iterator]()
        iterator.next()
        for (const [i, boundWitness] of iterator) {
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, cursor: boundWitnesses[i - 1]._sequence, order: 'desc',
            })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(PayloadBuilder.omitMeta(result)).toEqual(PayloadBuilder.omitMeta(boundWitness))
        }
      })
    })
  })
})
