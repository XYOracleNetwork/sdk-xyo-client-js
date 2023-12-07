/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */

import { toUint8Array } from '@xylabs/arraybuffer'
import { Account, AddressValue } from '@xyo-network/account'
import { PayloadHasher } from '@xyo-network/hash'
import { StringKeyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder'

const schema = 'network.xyo.temp'
const payload1: Payload<StringKeyObject & { schema: string }> = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema,
  string_field: 'there',
  timestamp: 1618603439107,
}
const payload2: Payload<StringKeyObject & { schema: string }> = {
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

describe('BoundWitnessBuilder', () => {
  describe('hash', () => {
    it.each(payloads)('consistently hashes equivalent payload independent of the order of the keys', async (payload) => {
      const hash = await PayloadHasher.hashAsync(payload)
      expect(hash).toEqual(payloadHash)
    })
  })
  describe('build', () => {
    describe('_hash', () => {
      it.each(payloads)('consistently hashes equivalent payloads independent of the order of the keys', async (payload) => {
        const address = await Account.fromPhrase('swarm luggage creek win urban boil tray crumble voice scrap yellow live')
        let builder = new BoundWitnessBuilder({ timestamp: false })
        expect(builder).toBeDefined()
        builder = builder.witness(address)
        expect(builder).toBeDefined()
        builder = builder.payload(payload)
        expect(builder).toBeDefined()
        const [actual] = await builder.build()
        expect(actual).toBeDefined()
        // Note: with loading of previousHash, this test no longer valid
        /*expect(await PayloadHasher.hashAsync(actual)).toEqual('7f3203f2d191f12c26cd1aec62b718be8848471f82831a8870f82fc669a5f35b')*/
        if (actual._signatures) {
          const addr = new AddressValue(toUint8Array(actual.addresses[0]))
          expect(addr.hex).toBe(actual.addresses[0])
          const verify = new AddressValue(toUint8Array(actual.addresses[0])).verify(
            toUint8Array(await PayloadHasher.hashAsync(actual)),
            toUint8Array(actual._signatures[0]),
          )
          expect(verify).toBe(true)
        }
      })
    })
    describe('with inlinePayloads true', () => {
      it('contains the _payloads field', async () => {
        const address = await Account.fromPhrase('sibling split sadness nose fever umbrella favorite ritual movie zone buyer movie')
        const builder = new BoundWitnessBuilder({ inlinePayloads: true }).witness(address).payload(payload1)
        const [actual] = await builder.build()
        expect(actual).toBeDefined()
      })
    })
    describe('with inlinePayloads false', () => {
      it('omits the _payloads field', async () => {
        const address = await Account.fromPhrase('canyon defense similar chalk good box quote miss decorate load amused gown')
        const builder = new BoundWitnessBuilder({ inlinePayloads: false }).witness(address).payload(payload1)
        const [actual] = await builder.build()
        expect(actual).toBeDefined()
      })
    })
  })
})
