import '@xylabs/vitest-extended'

import { toHex } from '@xylabs/hex'
import {
  describe, expect, it,
} from 'vitest'

import { StorageMetaWrapper } from '../StorageMetaWrapper.ts'

describe('StorageMetaWrapper', () => {
  describe('from', () => {
    it('parse', () => {
      const now = Date.now()
      const hash = toHex('1269b95d3ebf1b1258a82ccca0b365fabf4b8c99bf8fc852e5045e30ad20fbb1')
      const wrapper = StorageMetaWrapper.from(now, hash)
      expect(wrapper.epoch()).toBe(StorageMetaWrapper.timestampToEpoch(now))
      expect(wrapper.nonce()).toBe(StorageMetaWrapper.hashToNonce(hash))
    })
  })
  describe.skip('with Fully Qualified Sequence', () => {
    it('parse', () => {
      const wrapper = StorageMetaWrapper.parse('0')
    })
  })
})
