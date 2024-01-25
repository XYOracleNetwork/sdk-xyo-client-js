import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessWrapper } from '../BoundWitnessWrapper'

describe('BoundWitnessWrapper', () => {
  describe('payloads', () => {
    const included1: Payload = { schema: 'network.xyo.test.1' }
    const included2: Payload = { schema: 'network.xyo.test.2' }
    //const excluded1 = PayloadWrapper.wrap({ schema: 'network.xyo.test.3' })
    const payloads = [included1, included2]
    const bw: () => Promise<BoundWitness> = async () =>
      (
        await BoundWitnessWrapper.parse({
          $meta: {
            signatures: [],
          },
          addresses: [],
          payload_hashes: await Promise.all(payloads.map((p) => PayloadHasher.hashAsync(p))),
          payload_schemas: payloads.map((p) => p.schema),
          previous_hashes: [],
          schema: BoundWitnessSchema,
        })
      ).jsonPayload()
    describe('get', () => {
      describe('when no payloads set', () => {
        it('returns an empty object', async () => {
          const sut = await BoundWitnessWrapper.parse(await bw())
          expect(await sut.payloadMap()).toEqual({})
        })
      })
      describe('when payloads set via ctor', () => {
        it('returns payloads', async () => {
          const builtPayloads = await Promise.all(payloads.map((payload) => PayloadBuilder.build(payload)))
          const sut = await BoundWitnessWrapper.wrap(await bw(), builtPayloads)
          expect(await sut.payloadMap()).toContainAllKeys(await Promise.all(builtPayloads.map((p) => p.$hash)))
          expect((await sut.payloadMap())[(await PayloadBuilder.build(included1)).$hash]).toBeDefined()
          expect((await sut.payloadMap())[(await PayloadBuilder.build(included2)).$hash]).toBeDefined()
        })
      })
    })
    /*describe('set', () => {
      it('sets payloads', async () => {
        const sut = await BoundWitnessWrapper.parse(await bw())
        sut.payloads = [included1, included2]
        expect(await sut.payloadMap()).toContainAllKeys(await Promise.all(payloads.map((p) => p.hashAsync())))
        expect((await sut.payloadMap())[await included1.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await included2.hashAsync()]).toBeDefined()
      })
      it('filters payloads not included in payload_hashes', async () => {
        const sut = await BoundWitnessWrapper.parse(await bw())
        sut.payloads = [...payloads, excluded1]
        expect(await sut.payloadMap()).not.toContainKey(await excluded1.hashAsync())
        expect((await sut.payloadMap())[await included1.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await included2.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await excluded1.hashAsync()]).toBeUndefined()
      })
    })*/
  })
})
