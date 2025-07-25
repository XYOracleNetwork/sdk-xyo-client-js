/* eslint-disable max-nested-callbacks */

import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { GenericPayloadDiviner, GenericPayloadDivinerConfigSchema } from '../Diviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('GenericPayloadDiviner', () => {
  let archivist: MemoryArchivist
  let sut: GenericPayloadDiviner
  let node: MemoryNode
  const payloadA: Payload<{ schema: string; url: string }> = {
    schema: 'network.xyo.test',
    url: 'https://xyo.network',
  }
  const payloadB: Payload<{ foo: string[]; schema: string }> = {
    foo: ['bar', 'baz'],
    schema: 'network.xyo.debug',
  }
  const payloadC: Payload<{ foo: string[]; schema: string }> = {
    foo: ['one', 'two'],
    schema: 'network.xyo.debug',
  }
  const payloadD: Payload<{ foo: string[]; schema: string }> = {
    foo: ['aaa', 'bbb'],
    schema: 'network.xyo.debug',
  }
  let insertedPayloads: WithStorageMeta<Payload>[] = []
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    for (const payload of [payloadA, payloadB, payloadC, payloadD]) {
      await delay(2)
      const [insertedPayload] = await archivist.insert([payload])
      insertedPayloads.push(insertedPayload)
    }
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
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => result.schema === schema)).toBe(true)
        })
        it('only return single payload of that schema', async () => {
          const schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(insertedPayloads[3]))
          expect(results.every(result => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (desc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 1, order: 'desc', schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(PayloadBuilder.omitStorageMeta(results[0])).toStrictEqual(payloadD)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(insertedPayloads[3]))
          expect(results.every(result => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (asc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 1, order: 'asc', schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(PayloadBuilder.omitStorageMeta(results[0])).toStrictEqual(payloadB)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(payloadB))
          expect(results.every(result => result.schema === 'network.xyo.debug')).toBe(true)
        })
      })
      describe('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => schemas.includes(result.schema))).toBe(true)
        })
      })
      describe('paging', () => {
        it('test paging with multiple calls (asc)', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, order: 'asc', schemas,
            })
            .build()
          const results = await sut.divine([query])
          console.warn('results', results)
          const resultSequences = results.map(result => result._sequence)
          expect(PayloadBuilder.omitStorageMeta(results)).toStrictEqual([payloadA, payloadB])
          expect(results.length).toBe(2)
          expect(resultSequences[0]).toBe(insertedPayloads[0]._sequence)
          expect(resultSequences[1]).toBe(insertedPayloads[1]._sequence)

          const cursor = resultSequences[1]
          const query2 = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, cursor, order: 'asc', schemas,
            })
            .build()
          const results2 = await sut.divine([query2])
          const resultSequences2 = results2.map(result => result._sequence)
          expect(results2.length).toBe(2)
          expect(resultSequences2[0]).toBe(insertedPayloads[2]._sequence)
          expect(resultSequences2[1]).toBe(insertedPayloads[3]._sequence)
          const cursor2 = resultSequences2[1]

          const query3 = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, cursor: cursor2, order: 'asc', schemas,
            })
            .build()
          const results3 = await sut.divine([query3])
          expect(results3).toBeArrayOfSize(0)
        })
        it('test paging with multiple calls (desc)', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, order: 'desc', schemas,
            })
            .build()
          const results = await sut.divine([query])
          const resultSequences = results.map(result => result._sequence)
          expect(results.length).toBe(2)
          expect(resultSequences[0]).toBe(insertedPayloads[3]._sequence)
          expect(resultSequences[1]).toBe(insertedPayloads[2]._sequence)

          const cursor = resultSequences[1]
          const query2 = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, cursor, order: 'desc', schemas,
            })
            .build()
          const results2 = await sut.divine([query2])
          const resultSequences2 = results2.map(result => result._sequence)
          expect(results2.length).toBe(2)
          expect(resultSequences2[0]).toBe(insertedPayloads[1]._sequence)
          expect(resultSequences2[1]).toBe(insertedPayloads[0]._sequence)
          const cursor2 = resultSequences2[1]

          const query3 = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({
              limit: 2, cursor: cursor2, order: 'desc', schemas,
            })
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
          const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithUrl>({ schema: PayloadDivinerQuerySchema })
            .fields({ url })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => (result as WithUrl)?.url === url)).toBe(true)
        })
      })
      describe('array', () => {
        const cases: string[][] = [['bar'], ['baz'], ['bar', 'baz']]
        it.each(cases)('only returns payloads that have an array containing all the values supplied', async (...foo) => {
          type WithFoo = { foo?: string[] }
          const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithFoo>({ schema: PayloadDivinerQuerySchema })
            .fields({ foo })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => foo.every(v => (result as unknown as WithFoo)?.foo?.includes(v)))).toBe(true)
        })
      })
    })
  })
  describe('on events', () => {
    it ('should listen to clear event', async () => {
      // clear the memory archivist before we test
      await archivist.clear()
      // insert a single payload
      const payload: Payload = { schema: 'network.xyo.test' }
      await archivist.insert([payload])
      // build query for a single schema
      const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
        .fields({ schemas: ['network.xyo.test'] })
        .build()
      // divine the payload
      const results = await sut.divine([query])
      // should be one but has two because of some payload inserted before cleared the archivist
      // but not the diviner cache
      expect(results).toBeArrayOfSize(1)
    })
  })
})
