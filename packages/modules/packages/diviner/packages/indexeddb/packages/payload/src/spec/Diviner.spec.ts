/**
 * @jest-environment jsdom
 */
/// <reference lib="dom" />
/* eslint-disable max-nested-callbacks */

import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import type { IndexDescription } from '@xyo-network/archivist-model'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'
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

import { IndexedDbPayloadDiviner } from '../Diviner.ts'

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
describe('IndexedDbPayloadDiviner', () => {
  const dbName = 'testDb'
  const storeName = 'testStore'
  let archivist: IndexedDbArchivist
  let sut: IndexedDbPayloadDiviner
  let node: MemoryNode
  const urlIndex: IndexDescription = { key: { url: 1 }, name: 'IX_url' }
  let payloadA: Payload<{ url: string }> = {
    schema: 'network.xyo.test',
    url: 'https://xyo.network',
  }
  let payloadB: Payload<{ foo: string[]; other: string }> = {
    foo: ['bar', 'baz'],
    other: 'value',
    schema: 'network.xyo.debug',
  }
  let insertedPayloads: WithStorageMeta<Payload>[] = []
  beforeAll(async () => {
    archivist = await IndexedDbArchivist.create({
      account: 'random',
      config: {
        dbName, schema: IndexedDbArchivist.defaultConfigSchema, storage: { indexes: [urlIndex] }, storeName,
      },
    })
    for (const payload of [payloadA, payloadB]) {
      await delay(2)
      const [insertedPayload] = await archivist.insert([payload])
      insertedPayloads.push(insertedPayload)
    }
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
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => result.schema === schema)).toBe(true)
        })
      })
      describe.skip('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => schemas.includes(result.schema))).toBe(true)
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        describe('with index', () => {
          it('only returns payloads with that property', async () => {
            type WithUrl = { url?: string }
            const url = payloadA.url
            const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithUrl>({ schema: PayloadDivinerQuerySchema })
              .fields({ url })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(result => (result as WithUrl)?.url === url)).toBe(true)
          })
        })
        describe('without index', () => {
          it('only returns payloads with that property', async () => {
            type WithOther = { other?: string }
            const other = payloadB.other
            const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithOther>({ schema: PayloadDivinerQuerySchema })
              .fields({ other })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(result => (result as WithOther)?.other === other)).toBe(true)
          })
        })
      })
      describe.skip('array', () => {
        const cases: string[][] = [['bar'], ['baz'], ['bar', 'baz']]
        it.each(cases)('only returns payloads that have an array containing all the values supplied', async (...foo) => {
          type WithFoo = { foo?: string[] }
          const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithFoo>({ schema: PayloadDivinerQuerySchema }).fields({ foo }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => foo.every(v => (result as unknown as WithFoo)?.foo?.includes(v)))).toBe(true)
        })
      })
    })
  })
  describe('with order', () => {
    describe('not set', () => {
      it('returns payloads in ascending order', async () => {
        const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(insertedPayloads)
      })
    })
    describe('asc', () => {
      it('returns payloads in ascending order', async () => {
        const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ order: 'asc' }).build()
        const results = await sut.divine([query])
        expect(results).toEqual(insertedPayloads)
      })
    })
    describe('desc', () => {
      it('returns payloads in descending order', async () => {
        const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ order: 'desc' }).build()
        const results = await sut.divine([query])
        expect(results).toEqual([...insertedPayloads].reverse())
      })
    })
  })
})
