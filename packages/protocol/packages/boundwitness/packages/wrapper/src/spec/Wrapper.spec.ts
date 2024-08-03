import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessWrapper } from '../BoundWitnessWrapper'

describe('BoundWitnessWrapper', () => {
  describe('payloads', () => {
    const included1: Payload = { schema: 'network.xyo.test.1' }
    const included2: Payload = { schema: 'network.xyo.test.2' }
    // const excluded1 = PayloadWrapper.wrap({ schema: 'network.xyo.test.3' })
    const payloads = [included1, included2]
    const bw: () => Promise<BoundWitness> = async () =>
      (
        await BoundWitnessWrapper.parse({
          $meta: {
            signatures: [],
          },
          addresses: [],
          payload_hashes: await Promise.all(payloads.map(p => PayloadBuilder.dataHash(p))),
          payload_schemas: payloads.map(p => p.schema),
          previous_hashes: [],
          schema: BoundWitnessSchema,
        })
      ).payload
    describe('get', () => {
      describe('when no payloads set', () => {
        it('returns an empty object', async () => {
          const sut = await BoundWitnessWrapper.parse(await bw())
          expect(await sut.payloadsDataHashMap()).toEqual({})
        })
      })
      describe('when payloads set via ctor', () => {
        it('returns payloads', async () => {
          const builtPayloads = await Promise.all(payloads.map(payload => PayloadBuilder.build(payload)))
          const sut = await BoundWitnessWrapper.wrap(await bw(), builtPayloads)
          expect(await sut.payloadsDataHashMap()).toContainAllKeys(await Promise.all(builtPayloads.map(p => p.$hash)))
          expect((await sut.payloadsDataHashMap())[(await PayloadBuilder.build(included1)).$hash]).toBeDefined()
          expect((await sut.payloadsDataHashMap())[(await PayloadBuilder.build(included2)).$hash]).toBeDefined()
        })
      })
    })
  })
})
