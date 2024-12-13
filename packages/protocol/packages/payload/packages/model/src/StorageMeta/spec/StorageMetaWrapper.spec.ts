import '@xylabs/vitest-extended'

import type { Address, Hash } from '@xylabs/hex'
import { toHex } from '@xylabs/hex'
import {
  describe, expect, it,
} from 'vitest'

import { StorageMetaWrapper } from '../StorageMetaWrapper.ts'

describe('StorageMetaWrapper', () => {
  const hash: Hash = toHex('1269b95d3ebf1b1258a82ccca0b365fabf4b8c99bf8fc852e5045e30ad20fbb1')
  const address: Address = 'b36d327210f67ad98be881ddf6ad1f1b3e2c5137'
  const timestamp = 1_234_567_890_123
  const wrapper: StorageMetaWrapper = StorageMetaWrapper.from(timestamp, hash, address)

  describe('epoch', () => {
    it('converts timestamp to epoch correctly', () => {
      expect(wrapper.epoch).toBe(StorageMetaWrapper.timestampToEpoch(timestamp))
      expect(wrapper.epoch).toBe('0000011f71fb04cb')
    })
  })

  describe('nonce', () => {
    it('derives nonce from hash correctly', () => {
      expect(wrapper.nonce).toBe(StorageMetaWrapper.hashToNonce(hash))
      expect(wrapper.nonce).toBe(hash.slice(-8 * 2))
      expect(wrapper.nonce).toBe('e5045e30ad20fbb1')
    })
  })

  describe('address', () => {
    it('stores the address correctly', () => {
      expect(wrapper.address).toBe(address)
    })
  })

  describe('localSequence', () => {
    it('concatenates epoch and nonce correctly', () => {
      expect(wrapper.localSequence).toBe(`${wrapper.epoch}${wrapper.nonce}`)
      expect(wrapper.localSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1')
    })
  })

  describe('qualifiedSequence', () => {
    it('concatenates localSequence and address correctly', () => {
      expect(wrapper.qualifiedSequence).toBe(`${wrapper.localSequence}${wrapper.address}`)
      expect(wrapper.qualifiedSequence).toBe(
        '0000011f71fb04cbe5045e30ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137',
      )
    })
  })
})
