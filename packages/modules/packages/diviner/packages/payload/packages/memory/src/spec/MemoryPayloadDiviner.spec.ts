/* eslint-disable max-nested-callbacks */

import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { GenericPayloadDivinerConfigSchema } from '@xyo-network/diviner-payload-generic'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  isSequenceStorageMeta, type Payload,
  SequenceConstants,
  type WithSequenceStorageMeta,
  type WithStorageMeta,
} from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MemoryPayloadDiviner } from '../MemoryPayloadDiviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('MemoryPayloadDiviner', () => {
  let archivist: MemoryArchivist
  let sut: MemoryPayloadDiviner
  let node: MemoryNode
  let payloadA: Payload<{ schema: string; url: string }>
  let payloadB: Payload<{ foo: string[]; schema: string }>
  let insertedPayloads: WithStorageMeta<Payload>[]
  beforeAll(async () => {
    payloadA = {
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
    }
    await delay(2)
    payloadB = {
      foo: ['bar', 'baz'],
      schema: 'network.xyo.debug',
    }

    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    insertedPayloads = await archivist.insert([payloadA, payloadB])
    sut = await MemoryPayloadDiviner.create({
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
      describe('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => schemas.includes(result.schema))).toBe(true)
        })
      })
    })
    describe('sequence', () => {
      describe('when order supplied', () => {
        describe('asc', () => {
          const order = 'asc'
          it('returns payloads greater than the supplied sequence', async () => {
            const cursor = SequenceConstants.minLocalSequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceStorageMeta)).toBeTruthy()
            expect((results.filter(isSequenceStorageMeta) as WithSequenceStorageMeta[]).every(result => result._sequence > cursor)).toBe(true)
          })
          it.skip('returns payloads equal to the supplied sequence (not a thing with _sequence)', async () => {
            // eslint-disable-next-line sonarjs/no-alphabetical-sort
            const cursor = insertedPayloads.toSorted()[1]._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceStorageMeta)).toBeTruthy()
            expect((results.filter(isSequenceStorageMeta) as WithSequenceStorageMeta[]).every(result => result._sequence !== cursor)).toBe(true)
          })
        })
        describe('desc', () => {
          const order = 'desc'
          it('returns payloads less than the supplied sequence', async () => {
            const cursor = SequenceConstants.maxLocalSequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceStorageMeta)).toBeTruthy()
            expect((results.filter(isSequenceStorageMeta) as WithSequenceStorageMeta[]).every(result => result._sequence < cursor)).toBe(true)
          })
          it.skip('returns payloads equal to the supplied sequence (not a thing with _sequence)', async () => {
            // eslint-disable-next-line sonarjs/no-alphabetical-sort
            const cursor = insertedPayloads.toSorted()[0]._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceStorageMeta)).toBe(true)
            expect((results.filter(isSequenceStorageMeta) as WithSequenceStorageMeta[]).every(result => result._sequence !== cursor)).toBe(true)
          })
        })
      })
      describe('when order not supplied', () => {
        it.skip('returns payloads equal to the supplied sequence (not a thing with _sequence)', async () => {
          for (const payload of insertedPayloads) {
            const cursor = payload._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ cursor }).build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceStorageMeta)).toBe(true)
            expect((results.filter(isSequenceStorageMeta) as WithSequenceStorageMeta[]).every(result => result._sequence !== cursor)).toBe(true)
          }
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        it('only returns payloads with that property', async () => {
          type WithUrl = { url?: string }
          const url = payloadA.url
          const query = new PayloadBuilder<PayloadDivinerQueryPayload & WithUrl>({ schema: PayloadDivinerQuerySchema }).fields({ url }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => (result as WithUrl)?.url === url)).toBe(true)
        })
      })
      describe('array', () => {
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
})
