import '@xylabs/vitest-extended'

import type { Address, Hash } from '@xylabs/hex'
import { toHex } from '@xylabs/hex'
import {
  describe, expect, it,
} from 'vitest'

import { SequenceConstants } from '../Sequence.ts'
import { SequenceParser } from '../SequenceParser.ts'

describe('SequenceParser', () => {
  const hash: Hash = toHex('1269b95d3ebf1b1258a82ccca0b365fabf4b8c99bf8fc852e5045e30ad20fbb1')
  const address: Address = 'b36d327210f67ad98be881ddf6ad1f1b3e2c5137'
  const timestamp = 1_234_567_890_123
  const parsed: SequenceParser = SequenceParser.from(timestamp, hash, address)

  describe('epoch', () => {
    it('converts timestamp to epoch correctly', () => {
      expect(parsed.epoch).toBe(SequenceParser.toEpoch(timestamp))
      expect(parsed.epoch).toBe('0000011f71fb04cb')
    })
  })

  describe('from', () => {
    it('parses sequence from timestamp and hash correctly', () => {
      const parsed = SequenceParser.from(timestamp, hash)
      const timestampHex = SequenceParser.toEpoch(timestamp)
      const nonceHex = SequenceParser.toNonce(hash)
      expect(parsed.localSequence).toBe(`${timestampHex}${nonceHex}`)
      expect(parsed.localSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1')
    })
    it('parses sequence from timestamp, hash, and address correctly', () => {
      const parsed = SequenceParser.from(timestamp, hash, address)
      const timestampHex = SequenceParser.toEpoch(timestamp)
      const nonceHex = SequenceParser.toNonce(hash)
      expect(parsed.localSequence).toBe(`${timestampHex}${nonceHex}`)
      expect(parsed.localSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1')
      expect(parsed.qualifiedSequence).toBe(`${timestampHex}${nonceHex}${address}`)
      expect(parsed.qualifiedSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137')
    })
    it('equivalently parses two local sequences with and without address', () => {
      const withAddress = SequenceParser.from(timestamp, hash, address)
      const withoutAddress = SequenceParser.from(timestamp, hash)
      expect(withAddress.localSequence).toEqual(withoutAddress.localSequence)
    })
    it('equivalently parses two qualified sequences with and without address', () => {
      const address = '0'.repeat(SequenceConstants.addressBytes * 2) as Address
      const withAddress = SequenceParser.from(timestamp, hash, address)
      const withoutAddress = SequenceParser.from(timestamp, hash)
      expect(withAddress.qualifiedSequence).toEqual(withoutAddress.qualifiedSequence)
    })
  })

  describe('nonce', () => {
    it('derives nonce from hash correctly', () => {
      expect(parsed.nonce).toBe(SequenceParser.toNonce(hash))
      expect(parsed.nonce).toBe(hash.slice(-8 * 2))
      expect(parsed.nonce).toBe('e5045e30ad20fbb1')
    })
  })

  describe('address', () => {
    it('stores the address correctly', () => {
      expect(parsed.address).toBe(address)
    })
  })

  describe('localSequence', () => {
    it('concatenates epoch and nonce correctly', () => {
      expect(parsed.localSequence).toBe(`${parsed.epoch}${parsed.nonce}`)
      expect(parsed.localSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1')
    })
  })

  describe('qualifiedSequence', () => {
    it('concatenates localSequence and address correctly', () => {
      expect(parsed.localSequence).toBe(`${parsed.epoch}${parsed.nonce}${parsed.address}`)
      expect(parsed.qualifiedSequence).toBe(`${parsed.localSequence}${parsed.address}`)
      expect(parsed.qualifiedSequence).toBe(
        '0000011f71fb04cbe5045e30ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137',
      )
    })
  })
})
