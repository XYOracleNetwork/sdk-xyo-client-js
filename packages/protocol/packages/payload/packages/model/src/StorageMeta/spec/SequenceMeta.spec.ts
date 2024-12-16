import '@xylabs/vitest-extended'

import {
  describe, expect, it,
} from 'vitest'

import { SequenceComponentMinMax } from '../Sequence.ts'

describe('SequenceParser', () => {
  describe('minEpoch', () => {
    it('minEpoch', () => {
      expect(SequenceComponentMinMax.minEpoch).toEqual('0000000000000000')
    })
  })
  describe('maxEpoch', () => {
    it('maxEpoch', () => {
      expect(SequenceComponentMinMax.maxEpoch).toEqual('ffffffffffffffff')
    })
  })
  describe('minNonce', () => {
    it('minNonce', () => {
      expect(SequenceComponentMinMax.minNonce).toEqual('0000000000000000')
    })
  })
  describe('maxNonce', () => {
    it('maxNonce', () => {
      expect(SequenceComponentMinMax.maxNonce).toEqual('ffffffffffffffff')
    })
  })
  describe('minAddress', () => {
    it('minAddress', () => {
      expect(SequenceComponentMinMax.minAddress).toEqual('0000000000000000000000000000000000000000')
    })
  })
  describe('maxAddress', () => {
    it('maxAddress', () => {
      expect(SequenceComponentMinMax.maxAddress).toEqual('ffffffffffffffffffffffffffffffffffffffff')
    })
  })
})
