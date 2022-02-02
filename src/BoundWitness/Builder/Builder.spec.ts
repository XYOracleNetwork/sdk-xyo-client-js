/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from '../../Address'
import { XyoPayload } from '../../models'
import { XyoBoundWitnessBuilder } from './Builder'

const schema = 'network.xyo.test'
const payload1: XyoPayload = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema,
  string_field: 'there',
  timestamp: 1618603439107,
}
const payload2: XyoPayload = {
  timestamp: 1618603439107,
  string_field: 'there',
  schema,
  object_field: {
    string_value: 'yo',
    number_value: 2,
  },
  number_field: 1,
}
const payloads = [payload1, payload2]
const payloadHash = 'c915c56dd93b5e0db509d1a63ca540cfb211e11f03039b05e19712267bb8b6db'
const jsonHash = '88a797ae29e94c495ea78187fcc0a2973df645e5f6134b59454e893a424fd10f'
const address = XyoAddress.fromPhrase('test')

describe('XyoBoundWitnessBuilder', () => {
  describe('hash', () => {
    it.each(payloads)('consistently hashes equivalent payload independent of the order of the keys', (payload) => {
      const hash = XyoBoundWitnessBuilder.hash(payload)
      expect(hash).toEqual(payloadHash)
    })
  })
  describe('build', () => {
    describe('_hash', () => {
      it.each(payloads)('consistently hashes equivalent payloads independent of the order of the keys', (payload) => {
        let builder = new XyoBoundWitnessBuilder()
        expect(builder).toBeDefined()
        builder = builder.witness(address, null)
        expect(builder).toBeDefined()
        builder = builder.payload(payload)
        expect(builder).toBeDefined()

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._hash).toEqual(jsonHash)
      })
    })
    describe('with inlinePayloads true', () => {
      it('contains the _payloads field', () => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads: true }).witness(address, null).payload(payload1)

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._payloads).toBeDefined()
      })
    })
    describe('with inlinePayloads false', () => {
      it('omits the _payloads field', () => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads: false }).witness(address, null).payload(payload1)

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._payloads).toBeUndefined()
      })
    })
  })
})
