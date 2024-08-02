/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-nested-callbacks */

import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWithMeta } from '@xyo-network/payload-model'

import { MemoryPayloadDiviner } from '../MemoryPayloadDiviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('GenericPayloadDiviner', () => {
  let archivist: MemoryArchivist
  let sut: MemoryPayloadDiviner
  let node: MemoryNode
  let payloadA: PayloadWithMeta<{ schema: string; url: string }>
  let payloadB: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadC: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadD: PayloadWithMeta<{ foo: string[]; schema: string }>
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

    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    await archivist.insert([payloadA, payloadB])
    await archivist.insert([payloadC, payloadD])
    const all = await archivist.all()
    console.log(all)
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
    await sut.start()
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
        it('only return single payload of that schema', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(payloadD.$hash)
          expect(results.every((result) => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (desc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
            .fields({ limit: 1, order: 'desc', schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(payloadD.$hash)
          expect(results.every((result) => result.schema === 'network.xyo.debug')).toBe(true)
        })
        it('only return single payload of that schema (asc)', async () => {
          const schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema })
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
          const query = await new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every((result) => schemas.includes(result.schema))).toBe(true)
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
