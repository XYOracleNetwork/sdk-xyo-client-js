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
  describe('from', () => {
    it('parse', () => {
      const wrapper = StorageMetaWrapper.from(timestamp, hash, address)
      expect(wrapper.epoch).toBe(StorageMetaWrapper.timestampToEpoch(timestamp))
      expect(wrapper.nonce).toBe(StorageMetaWrapper.hashToNonce(hash))
      expect(wrapper.nonce).toBe(hash.slice(-8 * 2))
      expect(wrapper.address).toBe(address)
      expect (wrapper.localSequence).toBe(`${wrapper.epoch}${wrapper.nonce}`)
      expect (wrapper.localSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1')
      expect (wrapper.qualifiedSequence).toBe(`${wrapper.epoch}${wrapper.nonce}${wrapper.address}`)
      expect (wrapper.qualifiedSequence).toBe(`${wrapper.localSequence}${wrapper.address}`)
      expect (wrapper.qualifiedSequence).toBe('0000011f71fb04cbe5045e30ad20fbb1b36d327210f67ad98be881ddf6ad1f1b3e2c5137')
    })
  })
  describe.skip('with Fully Qualified Sequence', () => {
    it('parse', () => {
      const wrapper = StorageMetaWrapper.parse('0')
    })
  })
})
