/**
 * @jest-environment jsdom
 */
/// <reference lib="dom" />
/* eslint-disable max-nested-callbacks */
/* eslint-disable sonarjs/no-duplicate-string */

import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { IndexDescription } from '@xyo-network/archivist-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
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

import { IndexedDbPayloadDiviner } from '../Diviner.ts'

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
describe('IndexedDbPayloadDiviner', () => {
  const dbName = 'testDb'
  const storeName = 'testStore'
  let archivist: IndexedDbArchivist
  let sut: IndexedDbPayloadDiviner
  let node: MemoryNode
  const urlIndex: IndexDescription = { key: { url: 1 }, name: 'IX_url' }
  let payloadA: Payload<{ url: string }>
  let payloadB: Payload<{ foo: string[]; other: string }>
  let payloads: Payload[]
  beforeAll(async () => {
    payloadA = await PayloadBuilder.build({
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
    })
    payloadB = await PayloadBuilder.build({
      foo: ['bar', 'baz'],
      other: 'value',
      schema: 'network.xyo.debug',
    })
    payloads = [payloadA, payloadB]

    archivist = await IndexedDbArchivist.create({
      account: 'random',
      config: { dbName, schema: IndexedDbArchivist.defaultConfigSchema, storage: { indexes: [urlIndex] }, storeName },
    })
    await archivist.insert(payloads)
    sut = await IndexedDbPayloadDiviner.create({
      account: 'random',
      config: {
        archivist: archivist.address,
        dbName,
        schema: IndexedDbPayloadDiviner.defaultConfigSchema,
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
    describe('schema', () => {
      describe('single', () => {
        it.each(['network.xyo.test', 'network.xyo.debug'])('only returns payloads of that schema', async (schema) => {
          const schemas = [schema]
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => result.schema === schema)).toBe(true)
        })
      })
      describe.skip('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => schemas.includes(result.schema))).toBe(true)
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        describe('with index', () => {
          it('only returns payloads with that property', async () => {
            type WithUrl = { url?: string }
            const url = payloadA.url
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload & WithUrl>({ schema: PayloadDivinerQuerySchema })
              .fields({ url })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as WithUrl)?.url === url)).toBe(true)
          })
        })
        describe('without index', () => {
          it('only returns payloads with that property', async () => {
            type WithOther = { other?: string }
            const other = payloadB.other
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload & WithOther>({ schema: PayloadDivinerQuerySchema })
              .fields({ other })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as WithOther)?.other === other)).toBe(true)
          })
        })
      })
      describe.skip('array', () => {
        const cases: string[][] = [['bar'], ['baz'], ['bar', 'baz']]
        it.each(cases)('only returns payloads that have an array containing all the values supplied', async (...foo) => {
          type WithFoo = { foo?: string[] }
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload & WithFoo>({ schema: PayloadDivinerQuerySchema }).fields({ foo }).build()
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
        const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(payloads)
      })
    })
    describe('asc', () => {
      it('returns payloads in ascending order', async () => {
        const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ order: 'asc' }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(payloads)
      })
    })
    describe('desc', () => {
      it('returns payloads in descending order', async () => {
        const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ order: 'desc' }).build()
        const results = await sut.divine([query])
        expect(results).toEqual([...payloads].reverse())
      })
    })
  })
  describe('with offset', () => {
    describe('when ascending order', () => {
      it('returns payloads from the beginning', async () => {
        for (const [i, boundWitness] of payloads.entries()) {
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, offset: i, order: 'asc' })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toEqual(boundWitness)
        }
      })
    })
    describe('when descending order', () => {
      it('returns payloads from the end', async () => {
        for (let i = 0; i < payloads.length; i++) {
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, offset: i, order: 'desc' })
            .build()
          const results = await sut.divine([query])
          expect(results).toBeArrayOfSize(1)
          const [result] = results
          expect(result).toEqual(payloads[payloads.length - i - 1])
        }
      })
    })
  })
})
