import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessWrapper } from '../Wrapper'

describe('BoundWitnessWrapper', () => {
  describe('ctor', () => {
    it('handles missing payloads', async () => {
      const payloads = [PayloadWrapper.parse({ schema: 'network.xyo.test' })]
      const bw = BoundWitnessWrapper.parse({
        _signatures: [],
        addresses: [],
        payload_hashes: await Promise.all(payloads.map((p) => p.hashAsync())),
        payload_schemas: payloads.map((p) => p.schema),
        previous_hashes: [],
        schema: BoundWitnessSchema,
      }).boundwitness
      const wrapper = new BoundWitnessWrapper(bw, [null as unknown as Payload])
    })
  })
  describe('payloads', () => {
    const included1 = PayloadWrapper.parse({ schema: 'network.xyo.test.1' })
    const included2 = PayloadWrapper.parse({ schema: 'network.xyo.test.2' })
    //const excluded1 = PayloadWrapper.parse({ schema: 'network.xyo.test.3' })
    const payloads = [included1, included2]
    const bw: () => Promise<BoundWitness> = async () =>
      BoundWitnessWrapper.parse({
        _signatures: [],
        addresses: [],
        payload_hashes: await Promise.all(payloads.map((p) => p.hashAsync())),
        payload_schemas: payloads.map((p) => p.schema),
        previous_hashes: [],
        schema: BoundWitnessSchema,
      }).payload()
    describe('get', () => {
      describe('when no payloads set', () => {
        it('returns an empty object', async () => {
          const sut = BoundWitnessWrapper.parse(await bw())
          expect(await sut.payloadMap()).toEqual({})
        })
      })
      describe('when payloads set via ctor', () => {
        it('returns payloads', async () => {
          const sut = new BoundWitnessWrapper(await bw(), payloads)
          expect(await sut.payloadMap()).toContainAllKeys(await Promise.all(payloads.map((p) => p.hashAsync())))
          expect((await sut.payloadMap())[await included1.hashAsync()]).toBeDefined()
          expect((await sut.payloadMap())[await included2.hashAsync()]).toBeDefined()
        })
      })
    })
    /*describe('set', () => {
      it('sets payloads', async () => {
        const sut = BoundWitnessWrapper.parse(await bw())
        sut.payloads = [included1, included2]
        expect(await sut.payloadMap()).toContainAllKeys(await Promise.all(payloads.map((p) => p.hashAsync())))
        expect((await sut.payloadMap())[await included1.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await included2.hashAsync()]).toBeDefined()
      })
      it('filters payloads not included in payload_hashes', async () => {
        const sut = BoundWitnessWrapper.parse(await bw())
        sut.payloads = [...payloads, excluded1]
        expect(await sut.payloadMap()).not.toContainKey(await excluded1.hashAsync())
        expect((await sut.payloadMap())[await included1.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await included2.hashAsync()]).toBeDefined()
        expect((await sut.payloadMap())[await excluded1.hashAsync()]).toBeUndefined()
      })
    })*/
  })
})
