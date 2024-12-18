import '@xylabs/vitest-extended'

import { toUint8Array } from '@xylabs/arraybuffer'
import type { StringKeyObject } from '@xylabs/object'
import {
  AddressValue, Elliptic, HDWallet,
} from '@xyo-network/account'
import { PayloadBuilder } from '@xyo-network/payload'
import type { Payload } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { BoundWitnessBuilder } from '../Builder.ts'

const schema = 'network.xyo.temp'
const payload1: Payload<StringKeyObject & { schema: string }> = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema,
  string_field: 'there',
  timestamp: 1_618_603_439_107,
}
const payload2: Payload<StringKeyObject & { schema: string }> = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema,
  string_field: 'there',
  timestamp: 1_618_603_439_107,
}
const payloads = [payload1, payload2]
const payloadHash = '3c817871cbf24708703e907dbc344b1b2aefcc3603d14d59c3a35a5c446410d1'

describe('BoundWitnessBuilder', () => {
  describe('hash', () => {
    it.each(payloads)('consistently hashes equivalent payload independent of the order of the keys', async (payload) => {
      const hash = await PayloadBuilder.dataHash(payload)
      expect(hash).toEqual(payloadHash)
    })
  })
  describe('build', () => {
    describe('_hash', () => {
      it.each(payloads)('consistently hashes equivalent payloads independent of the order of the keys', async (payload) => {
        const address = await HDWallet.fromPhrase('swarm luggage creek win urban boil tray crumble voice scrap yellow live')
        let builder = new BoundWitnessBuilder()
        expect(builder).toBeDefined()
        builder = builder.signer(address)
        expect(builder).toBeDefined()
        builder = builder.payload(payload)
        expect(builder).toBeDefined()
        const [actual] = await builder.build()
        expect(actual).toBeDefined()
        if (actual.$meta?.signatures) {
          const addr = new AddressValue(toUint8Array(actual.addresses[0]).buffer)
          expect(addr.hex).toBe(actual.addresses[0])
          const verify = await Elliptic.verify(toUint8Array(actual.$hash).buffer, toUint8Array(actual.$meta.signatures[0]).buffer, addr.bytes)
          expect(verify).toBe(true)
        }
      })
    })
    describe('with payloads', () => {
      it('omits the _payloads field', async () => {
        const address = await HDWallet.fromPhrase('canyon defense similar chalk good box quote miss decorate load amused gown')
        const builder = new BoundWitnessBuilder().signer(address).payload(payload1)
        const [actual] = await builder.build()
        expect(actual).toBeDefined()
      })
    })
  })
})
