/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoHasher } from '../../Hasher'
import { XyoPayload } from '../../Payload'
import { XyoAccount, XyoAddressValue } from '../../Wallet'
import { XyoBoundWitnessBuilder } from './Builder'

const schema = 'network.xyo.temp'
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
const payloadHash = '3c817871cbf24708703e907dbc344b1b2aefcc3603d14d59c3a35a5c446410d1'

describe('XyoBoundWitnessBuilder', () => {
  describe('hash', () => {
    it.each(payloads)('consistently hashes equivalent payload independent of the order of the keys', (payload) => {
      const hash = new XyoHasher(payload).sortedHash()
      expect(hash).toEqual(payloadHash)
    })
  })
  describe('build', () => {
    describe('_hash', () => {
      it.each(payloads)('consistently hashes equivalent payloads independent of the order of the keys', (payload) => {
        const address = XyoAccount.fromPhrase('test1')
        let builder = new XyoBoundWitnessBuilder()
        expect(builder).toBeDefined()
        builder = builder.witness(address)
        expect(builder).toBeDefined()
        builder = builder.payload(payload)
        expect(builder).toBeDefined()

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._hash).toEqual('7f3203f2d191f12c26cd1aec62b718be8848471f82831a8870f82fc669a5f35b')

        if (actual._hash && actual._signatures) {
          const addr = new XyoAddressValue(actual.addresses[0])
          expect(addr.hex).toBe(actual.addresses[0])
          const verify = new XyoAddressValue(actual.addresses[0]).verify(actual._hash, actual._signatures[0])
          expect(verify).toBe(true)
        }
      })
    })
    describe('with inlinePayloads true', () => {
      it('contains the _payloads field', () => {
        const address = XyoAccount.fromPhrase('test2')
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads: true }).witness(address).payload(payload1)

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._payloads).toBeDefined()
      })
    })
    describe('with inlinePayloads false', () => {
      it('omits the _payloads field', () => {
        const address = XyoAccount.fromPhrase('test3')
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads: false }).witness(address).payload(payload1)

        const actual = builder.build()

        expect(actual).toBeDefined()
        expect(actual._payloads).toBeUndefined()
      })
    })
  })
})
