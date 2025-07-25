import '@xylabs/vitest-extended'

import type { Address } from '@xylabs/hex'
import {
  asAddress, asHash, toHex,
} from '@xylabs/hex'
import {
  describe, expect, it,
} from 'vitest'

import { SequenceConstants, SequenceParser } from '../sequence/index.ts'

describe('SequenceParser', () => {
  const hash = asHash('1269b95d3ebf1b1258a82ccca0b365fabf4b8c99bf8fc852e5045e30ad20fbb1', true)
  const address = asAddress('b36d327210f67ad98be881ddf6ad1f1b3e2c5137', true)
  const timestamp = 1_234_567_890_123
  const parsed: SequenceParser = SequenceParser.from(timestamp, hash, address)
  const parsedWithIndex: SequenceParser = SequenceParser.from(timestamp, hash, 5, address)

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
      expect(parsed.localSequence).toBe('0000011f71fb04cb00000000ad20fbb1')
    })
    it('parses sequence from timestamp, hash, and address correctly', () => {
      const parsed = SequenceParser.from(timestamp, hash, address)
      const timestampHex = SequenceParser.toEpoch(timestamp)
      const nonceHex = SequenceParser.toNonce(hash)
      expect(parsed.localSequence).toBe(`${timestampHex}${nonceHex}`)
      expect(parsed.localSequence).toBe('0000011f71fb04cb00000000ad20fbb1')
      expect(parsed.qualifiedSequence).toBe(`${timestampHex}${nonceHex}${address}`)
      expect(parsed.qualifiedSequence).toBe('0000011f71fb04cb00000000ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137')
    })
    it('parses sequence from timestamp, hash, index, and address correctly', () => {
      const parsed = SequenceParser.from(timestamp, hash, 5, address)
      const timestampHex = SequenceParser.toEpoch(timestamp)
      const nonceHex = SequenceParser.toNonce(hash, 5)
      expect(parsed.localSequence).toBe(`${timestampHex}${nonceHex}`)
      expect(parsed.localSequence).toBe('0000011f71fb04cb00000005ad20fbb1')
      expect(parsed.qualifiedSequence).toBe(`${timestampHex}${nonceHex}${address}`)
      expect(parsed.qualifiedSequence).toBe('0000011f71fb04cb00000005ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137')
    })
    it('equivalently parses two local sequences with and without address', () => {
      const withAddress = SequenceParser.from(timestamp, hash, address)
      const withoutAddress = SequenceParser.from(timestamp, hash)
      expect(withAddress.localSequence).toEqual(withoutAddress.localSequence)
    })
    it('equivalently parses two local sequences with and without address (with index)', () => {
      const withAddress = SequenceParser.from(timestamp, hash, 8, address)
      const withoutAddress = SequenceParser.from(timestamp, hash, 8)
      expect(withAddress.localSequence).toEqual(withoutAddress.localSequence)
    })
    it('equivalently parses two qualified sequences with and without address', () => {
      const address = '0'.repeat(SequenceConstants.addressBytes * 2) as Address
      const withAddress = SequenceParser.from(timestamp, hash, address)
      const withoutAddress = SequenceParser.from(timestamp, hash)
      expect(withAddress.qualifiedSequence).toEqual(withoutAddress.qualifiedSequence)
    })
    it('equivalently parses two qualified sequences with and without address (with index)', () => {
      const address = '0'.repeat(SequenceConstants.addressBytes * 2) as Address
      const withAddress = SequenceParser.from(timestamp, hash, 9, address)
      const withoutAddress = SequenceParser.from(timestamp, hash, 9)
      expect(withAddress.qualifiedSequence).toEqual(withoutAddress.qualifiedSequence)
    })
  })

  describe('nonce', () => {
    it('derives nonce from hash correctly', () => {
      expect(parsed.nonce).toBe(SequenceParser.toNonce(hash))
      expect(parsed.nonce).toBe(toHex(0, { bitLength: SequenceConstants.nonceIndexBytes * 8 }) + hash.slice(-SequenceConstants.nonceHashBytes * 2))
      expect(parsed.nonce).toBe('00000000ad20fbb1')
    })

    it('derives nonce from hash correctly', () => {
      expect(parsedWithIndex.nonce).toBe(SequenceParser.toNonce(hash, 5))
      expect(parsedWithIndex.nonce).toBe(toHex(5, { bitLength: SequenceConstants.nonceIndexBytes * 8 }) + hash.slice(-SequenceConstants.nonceHashBytes * 2))
      expect(parsedWithIndex.nonce).toBe('00000005ad20fbb1')
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
      expect(parsed.localSequence).toBe('0000011f71fb04cb00000000ad20fbb1')
    })
  })

  describe('qualifiedSequence', () => {
    it('concatenates localSequence and address correctly', () => {
      expect(parsed.qualifiedSequence).toBe(`${parsed.epoch}${parsed.nonce}${parsed.address}`)
      expect(parsed.qualifiedSequence).toBe(`${parsed.localSequence}${parsed.address}`)
      expect(parsed.qualifiedSequence).toBe(
        '0000011f71fb04cb00000000ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137',
      )
    })
  })
})
