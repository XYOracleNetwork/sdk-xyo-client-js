/** @jest-environment jsdom */
/* eslint-disable sonarjs/no-duplicate-string */

import { Hash } from '@xylabs/hex'
import { EmptyObject } from '@xylabs/object'
import { IndexedDbArchivist } from '@xyo-network/archivist-indexeddb'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWithMeta } from '@xyo-network/payload-model'
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

import { GenericPayloadDiviner, GenericPayloadDivinerConfigSchema } from '../Diviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('GenericPayloadDiviner', () => {
  let archivist: IndexedDbArchivist
  let sut: GenericPayloadDiviner
  let node: MemoryNode
  let payloadA: PayloadWithMeta<{ schema: string; url: string }>
  let payloadB: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadC: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadD: PayloadWithMeta<{ foo: string[]; schema: string }>

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

  beforeAll(async () => {
    payloadA = await PayloadBuilder.build({
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
    })
    payloadB = await PayloadBuilder.build({
      foo: ['bar', 'baz'],
      schema: 'network.xyo.debug',
    })
    payloadC = await PayloadBuilder.build({
      foo: ['one', 'two'],
      schema: 'network.xyo.debug',
    })
    payloadD = await PayloadBuilder.build({
      foo: ['aaa', 'bbb'],
      schema: 'network.xyo.debug',
    })

    archivist = await IndexedDbArchivist.create({
      account: 'random',
      config: { name: 'test', schema: IndexedDbArchivist.defaultConfigSchema },
    })
    await archivist.insert([payloadA, payloadB])
    await archivist.insert([payloadC, payloadD])
    const all = await archivist.all()
    console.log(all)
    sut = await GenericPayloadDiviner.create({
      account: 'random',
      config: {
        archivist: archivist.address,
        schema: GenericPayloadDivinerConfigSchema,
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
    await sut.start()
  })
  describe('with filter for', () => {
    describe('schema', () => {
      describe('single', () => {
        it.each(['network.xyo.test', 'network.xyo.debug'])('only returns payloads of that schema', async (schema) => {
          const schemas = [schema]
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => result.schema === schema)).toBe(true)
        })
        it('only return single payload of that schema', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(payloadD.$hash)
          expect(results.every((result) => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (desc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, order: 'desc', schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(payloadD.$hash)
          expect(results.every((result) => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (asc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, order: 'asc', schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(payloadB.$hash)
          expect(results.every((result) => result.schema === 'network.xyo.debug')).toBe(true)
        })
      })
      describe('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => schemas.includes(result.schema))).toBe(true)
        })
      })
      describe('paging', () => {
        it('test paging with multiple calls (asc)', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, order: 'asc', schemas })
            .build()
          const results = await sut.divine([query])
          const resultHashes = await PayloadBuilder.hashes(results)
          expect(results.length).toBe(2)
          expect(resultHashes[0]).toBe(await PayloadBuilder.hash(payloadA))
          expect(resultHashes[1]).toBe(await PayloadBuilder.hash(payloadB))

          const offset = resultHashes[1]
          const query2 = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, offset, order: 'asc', schemas })
            .build()
          const results2 = await sut.divine([query2])
          const resultHashes2 = await PayloadBuilder.hashes(results2)
          expect(results2.length).toBe(2)
          expect(resultHashes2[0]).toBe(await PayloadBuilder.hash(payloadC))
          expect(resultHashes2[1]).toBe(await PayloadBuilder.hash(payloadD))
          const offset2 = resultHashes2[1]

          const query3 = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, offset: offset2, order: 'asc', schemas })
            .build()
          const results3 = await sut.divine([query3])
          expect(results3).toBeArrayOfSize(0)
        })
        it('test paging with multiple calls (desc)', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, order: 'desc', schemas })
            .build()
          const results = await sut.divine([query])
          const resultHashes = await PayloadBuilder.hashes(results)
          expect(results.length).toBe(2)
          expect(resultHashes[0]).toBe(await PayloadBuilder.hash(payloadD))
          expect(resultHashes[1]).toBe(await PayloadBuilder.hash(payloadC))

          const offset = resultHashes[1]
          const query2 = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, offset, order: 'desc', schemas })
            .build()
          const results2 = await sut.divine([query2])
          const resultHashes2 = await PayloadBuilder.hashes(results2)
          expect(results2.length).toBe(2)
          expect(resultHashes2[0]).toBe(await PayloadBuilder.hash(payloadB))
          expect(resultHashes2[1]).toBe(await PayloadBuilder.hash(payloadA))
          const offset2 = resultHashes2[1]

          const query3 = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash>>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 2, offset: offset2, order: 'desc', schemas })
            .build()
          const results3 = await sut.divine([query3])
          expect(results3).toBeArrayOfSize(0)
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        it('only returns payloads with that property', async () => {
          type WithUrl = { url?: string }
          const url = payloadA.url
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash> & WithUrl>({ schema: PayloadDivinerQuerySchema })
            .fields({ url })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => (result as WithUrl)?.url === url)).toBe(true)
        })
      })
      describe('array', () => {
        const cases: string[][] = [['bar'], ['baz'], ['bar', 'baz']]
        it.each(cases)('only returns payloads that have an array containing all the values supplied', async (...foo) => {
          type WithFoo = { foo?: string[] }
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload<EmptyObject, Hash> & WithFoo>({ schema: PayloadDivinerQuerySchema })
            .fields({ foo })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          // eslint-disable-next-line max-nested-callbacks
          expect(results.every((result) => foo.every((v) => (result as unknown as WithFoo)?.foo?.includes(v)))).toBe(true)
        })
      })
    })
  })
})
