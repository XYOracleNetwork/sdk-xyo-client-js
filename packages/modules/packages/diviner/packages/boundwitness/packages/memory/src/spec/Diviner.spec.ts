import '@xylabs/vitest-extended'

import { delay } from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  asSchema, type Payload, type Schema,
} from '@xyo-network/payload-model'
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
  const payloadA: Payload<{ schema: string; url: string }> = {
    schema: asSchema('network.xyo.test', true),
    url: 'https://xyo.network',
  }
  const payloadB: Payload<{ foo: string[]; schema: string }> = {
    foo: ['bar', 'baz'],
    schema: asSchema('network.xyo.debug', true),
  }
  const payloadC: Payload<{ foo: string[]; schema: string }> = {
    foo: ['one', 'two'],
    schema: asSchema('network.xyo.debug', true),
  }
  const payloadD: Payload<{ foo: string[]; schema: string }> = {
    foo: ['aaa', 'bbb'],
    schema: asSchema('network.xyo.debug', true),
  }
  const bws: BoundWitness[] = []
  beforeAll(async () => {
    const account = await Account.random()
    const [bwA] = await new BoundWitnessBuilder().signers([account]).payloads([payloadA]).build()
    bws.push(bwA)
    const [bwB] = await new BoundWitnessBuilder().signers([account]).payloads([payloadB]).build()
    bws.push(bwB)
    const [bwC] = await new BoundWitnessBuilder().signers([account]).payloads([payloadC]).build()
    bws.push(bwC)
    const [bwD] = await new BoundWitnessBuilder().signers([account]).payloads([payloadD]).build()
    bws.push(bwD)
    const [bwAB] = await new BoundWitnessBuilder().signers([account]).payloads([payloadA, payloadB]).build()
    bws.push(bwAB)

    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'test', schema: MemoryArchivist.defaultConfigSchema },
    })
    for (const payload of [payloadA, payloadB, payloadC, payloadD, bwA, bwB, bwC, bwD, bwAB]) {
      await delay(2)
      await archivist.insert([payload])
    }
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
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(results.every(result => result.payload_schemas.includes(schema))).toBe(true)
        })
        it('only return single bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ limit: 1, payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(bws[4]))
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
        it('only return single bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, order: 'asc', payload_schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(bws[1]))
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
        it('only return single bw that contains that schema (desc)', async () => {
          const payload_schemas = ['network.xyo.debug']
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({
              limit: 1, order: 'desc', payload_schemas,
            })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBe(1)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(bws[4]))
          expect(results.every(result => result.payload_schemas.includes('network.xyo.debug'))).toBe(true)
        })
      })
      describe('multiple', () => {
        it('only returns bw that contains that schema', async () => {
          const payload_schemas = ['network.xyo.test', 'network.xyo.debug'] as Schema[]
          const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
            .fields({ payload_schemas })
            .build()
          const results = await sut.divine([query])
          expect(results.length).toBeGreaterThan(0)
          expect(await PayloadBuilder.dataHash(results[0])).toBe(await PayloadBuilder.dataHash(bws[4]))
          expect(results.every(result => payload_schemas.includes(asSchema(result.payload_schemas.at(0), true)))).toBe(true)
        })
      })
    })
  })
})
