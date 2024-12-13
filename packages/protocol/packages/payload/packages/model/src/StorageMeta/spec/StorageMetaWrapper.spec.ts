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
  describe('from', () => {
    it('parse', () => {
      const now = Date.now()
      const wrapper = StorageMetaWrapper.from(now, hash, address)
      expect(wrapper.epoch).toBe(StorageMetaWrapper.timestampToEpoch(now))
      expect(wrapper.nonce).toBe(StorageMetaWrapper.hashToNonce(hash))
      expect(wrapper.address).toBe(address)
    })
  })
  describe.skip('with Fully Qualified Sequence', () => {
    it('parse', () => {
      const wrapper = StorageMetaWrapper.parse('0')
    })
  })
})
