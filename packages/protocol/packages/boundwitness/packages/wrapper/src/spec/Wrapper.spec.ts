import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessWrapper } from '../Wrapper'

describe('BoundWitnessWrapper', () => {
  describe('payloads', () => {
    const included1 = PayloadWrapper.parse({ schema: 'network.xyo.test.1' })
    const included2 = PayloadWrapper.parse({ schema: 'network.xyo.test.2' })
    const excluded1 = PayloadWrapper.parse({ schema: 'network.xyo.test.3' })
    const payloads = [included1, included2]
    const bw: BoundWitness = {
      _signatures: [],
      addresses: [],
      payload_hashes: payloads.map((p) => p.hash),
      payload_schemas: payloads.map((p) => p.schema),
      previous_hashes: [],
      schema: BoundWitnessSchema,
    }
    describe('get', () => {
      describe('when no payloads set', () => {
        it('returns an empty object', () => {
          const sut = BoundWitnessWrapper.parse(bw)
          expect(sut.payloads).toEqual({})
        })
      })
      describe('when payloads set via ctor', () => {
        it('returns payloads', () => {
          const sut = new BoundWitnessWrapper(bw, payloads)
          expect(sut.payloads).toContainAllKeys(payloads.map((p) => p.hash))
          expect(sut.payloads[included1.hash]).toBeDefined()
          expect(sut.payloads[included2.hash]).toBeDefined()
        })
      })
    })
    describe('set', () => {
      it('sets payloads', () => {
        const sut = BoundWitnessWrapper.parse(bw)
        sut.payloads = [included1, included2]
        expect(sut.payloads).toContainAllKeys(payloads.map((p) => p.hash))
        expect(sut.payloads[included1.hash]).toBeDefined()
        expect(sut.payloads[included2.hash]).toBeDefined()
      })
      it('filters payloads not included in payload_hashes', () => {
        const sut = BoundWitnessWrapper.parse(bw)
        sut.payloads = [...payloads, excluded1]
        expect(sut.payloads).not.toContainKey(excluded1.hash)
        expect(sut.payloads[included1.hash]).toBeDefined()
        expect(sut.payloads[included2.hash]).toBeDefined()
        expect(sut.payloads[excluded1.hash]).toBeUndefined()
      })
    })
  })
})
