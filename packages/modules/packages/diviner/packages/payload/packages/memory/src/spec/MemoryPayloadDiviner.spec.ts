/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-nested-callbacks */

import { delay } from '@xylabs/delay'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWithMeta } from '@xyo-network/payload-model'

import { MemoryPayloadDiviner } from '../MemoryPayloadDiviner.js'

/**
 * @group module
 * @group diviner
 */

describe('MemoryPayloadDiviner', () => {
  let archivist: MemoryArchivist
  let sut: MemoryPayloadDiviner
  let node: MemoryNode
  let payloadA: PayloadWithMeta<{ timestamp: number; schema: string; url: string }>
  let payloadB: PayloadWithMeta<{ timestamp: number; foo: string[]; schema: string }>
  beforeAll(async () => {
    payloadA = await PayloadBuilder.build({
      schema: 'network.xyo.test',
      url: 'https://xyo.network',
      timestamp: Date.now(),
    })
    await delay(2)
    payloadB = await PayloadBuilder.build({
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
        schema: MemoryPayloadDiviner.defaultConfigSchema,
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
      describe('multiple', () => {
        it('only returns payloads of that schema', async () => {
          const schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => schemas.includes(result.schema))).toBe(true)
        })
      })
    })
    describe('timestamp', () => {
      describe('when order supplied', () => {
        describe('asc', () => {
          const order = 'asc'
          it('returns payloads greater than the supplied timestamp', async () => {
            const timestamp = [payloadA, payloadB].sort((a, b) => a.timestamp - b.timestamp)[0].timestamp - 1
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, timestamp })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as unknown as { timestamp: number }).timestamp > timestamp)).toBe(true)
          })
          it('returns payloads equal to the supplied timestamp', async () => {
            const timestamp = [payloadA, payloadB].sort((a, b) => a.timestamp - b.timestamp)[1].timestamp
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, timestamp })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as unknown as { timestamp: number }).timestamp === timestamp)).toBe(true)
          })
        })
        describe('desc', () => {
          const order = 'desc'
          it('returns payloads less than the supplied timestamp', async () => {
            const timestamp = [payloadA, payloadB].sort((a, b) => a.timestamp - b.timestamp)[1].timestamp + 1
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, timestamp })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as unknown as { timestamp: number }).timestamp <= timestamp)).toBe(true)
          })
          it('returns payloads equal to the supplied timestamp', async () => {
            const timestamp = [payloadA, payloadB].sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
              .fields({ order, timestamp })
              .build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as unknown as { timestamp: number }).timestamp === timestamp)).toBe(true)
          })
        })
      })
      describe('when order not supplied', () => {
        it('returns payloads equal to the supplied timestamp', async () => {
          for (const payload of [payloadA, payloadB]) {
            const timestamp = payload.timestamp
            const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ timestamp }).build()
            const results = await sut.divine([query])
            expect(results.length).toBeGreaterThan(0)
            expect(results.every((result) => (result as unknown as { timestamp: number }).timestamp === timestamp)).toBe(true)
          }
        })
      })
    })
    describe('custom field', () => {
      describe('property', () => {
        it('only returns payloads with that property', async () => {
          type WithUrl = { url?: string }
          const url = payloadA.url
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload & WithUrl>({ schema: PayloadDivinerQuerySchema }).fields({ url }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => (result as WithUrl)?.url === url)).toBe(true)
        })
      })
      describe('array', () => {
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
})
