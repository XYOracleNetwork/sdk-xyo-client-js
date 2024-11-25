import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MemoryBoundWitnessDiviner } from '../MemoryBoundWitnessDiviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('MemoryBoundWitnessDiviner', () => {
  let archivist: MemoryArchivist
  let sut: MemoryBoundWitnessDiviner
  let node: MemoryNode
  let payloadA: PayloadWithMeta<{ schema: string; url: string }>
  let payloadB: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadC: PayloadWithMeta<{ foo: string[]; schema: string }>
  let payloadD: PayloadWithMeta<{ foo: string[]; schema: string }>
  const bws: WithMeta<BoundWitness>[] = []
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

    const account = await Account.random()

    const [bwA] = await BoundWitnessBuilder.build({ accounts: [account], payloads: [payloadA] })
    bws.push(bwA)
    const [bwB] = await BoundWitnessBuilder.build({ accounts: [account], payloads: [payloadB] })
    bws.push(bwB)
    const [bwC] = await BoundWitnessBuilder.build({ accounts: [account], payloads: [payloadC] })
    bws.push(bwC)
    const [bwD] = await BoundWitnessBuilder.build({ accounts: [account], payloads: [payloadD] })
    bws.push(bwD)
    const [bwAB] = await BoundWitnessBuilder.build({ accounts: [account], payloads: [payloadA, payloadB] })
    bws.push(bwAB)

    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    await archivist.insert([payloadA, payloadB])
    await archivist.insert([payloadC, payloadD])
    await archivist.insert([bwA, bwB, bwC, bwD, bwAB])
    sut = await MemoryBoundWitnessDiviner.create({
      account: 'random',
      config: {
        archivist: archivist.address,
        schema: MemoryBoundWitnessDiviner.defaultConfigSchema,
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
        it.each(['network.xyo.test', 'network.xyo.debug'])('only returns bw that contains that schema', async (schema) => {
          const payload_schemas = [schema]
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => result.payload_schemas.includes(schema))).toBe(true)
        })
        it('only return single bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ limit: 1, payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(bws[4].$hash)
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
        it('only return single bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, order: 'asc', payload_schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(bws[1].$hash)
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
        it('only return single bw that contains that schema (desc)', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, order: 'desc', payload_schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(results[0].$hash).toBe(bws[4].$hash)
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
      })
      describe('multiple', () => {
        it('only returns bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.test', 'network.xyo.debug']
          const query = await new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results[0].$hash).toBe(bws[4].$hash)
          expect(results.every(result => payload_schemas.includes(result.payload_schemas[0]))).toBe(true)
        })
      })
    })
  })
})
