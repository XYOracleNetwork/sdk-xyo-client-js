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
  isSequenceMeta, type Payload,
  StorageMetaConstants,
  type WithSequenceMeta,
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
  let payloadA: WithSequenceMeta<Payload<{ schema: string; url: string }>>
  let payloadB: WithSequenceMeta<Payload<{ foo: string[]; schema: string }>>
  beforeAll(async () => {
    payloadA = await PayloadBuilder.addSequencedStorageMeta({
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
    })
    await delay(2)
    payloadB = await PayloadBuilder.addSequencedStorageMeta({
      foo: ['bar', 'baz'],
      schema: 'network.xyo.debug',
      timestamp: Date.now(),
    })

    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    await archivist.insert([payloadA, payloadB])
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
            const cursor = StorageMetaConstants.minLocalSequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceMeta)).toBeTruthy()
            expect((results.filter(isSequenceMeta) as WithSequenceMeta[]).every(result => result._sequence > cursor)).toBe(true)
          })
          it('returns payloads equal to the supplied sequence', async () => {
            const cursor = [payloadA, payloadB].sort()[1]._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceMeta)).toBeTruthy()
            expect((results.filter(isSequenceMeta) as WithSequenceMeta[]).every(result => result._sequence !== cursor)).toBe(true)
          })
        })
        describe('desc', () => {
          const order = 'desc'
          it('returns payloads less than the supplied sequence', async () => {
            const cursor = StorageMetaConstants.maxLocalSequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceMeta)).toBeTruthy()
            expect((results.filter(isSequenceMeta) as WithSequenceMeta[]).every(result => result._sequence < cursor)).toBe(true)
          })
          it('returns payloads equal to the supplied sequence', async () => {
            const cursor = [payloadA, payloadB].sort()[0]._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, cursor })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceMeta)).toBe(true)
            expect((results.filter(isSequenceMeta) as WithSequenceMeta[]).every(result => result._sequence !== cursor)).toBe(true)
          })
        })
      })
      describe('when order not supplied', () => {
        it('returns payloads equal to the supplied sequence', async () => {
          for (const payload of [payloadA, payloadB]) {
            const cursor = payload._sequence
            const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ cursor }).build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every(isSequenceMeta)).toBe(true)
            expect((results.filter(isSequenceMeta) as WithSequenceMeta[]).every(result => result._sequence !== cursor)).toBe(true)
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
