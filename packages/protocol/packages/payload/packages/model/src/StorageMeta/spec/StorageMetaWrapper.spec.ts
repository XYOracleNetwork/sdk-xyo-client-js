import '@xylabs/vitest-extended'

import {
  describe, expect, it,
} from 'vitest'

import { StorageMetaWrapper } from '../StorageMetaWrapper.ts'

describe('StorageMetaWrapper', () => {
  describe('with Fully Qualified Sequence', () => {
    it('parse', () => {
      const wrapper = StorageMetaWrapper.parse('0')
    })
  })
})
