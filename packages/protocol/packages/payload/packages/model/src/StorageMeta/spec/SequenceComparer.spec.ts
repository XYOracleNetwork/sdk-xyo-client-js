// SequenceComparer.spec.ts

import type { Address } from '@xylabs/hex'
import {
  describe, expect, it,
} from 'vitest'

import type {
  Epoch, Nonce, Sequence,
} from '../sequence/index.ts'
import {
  SequenceComparer,
  SequenceParser,
} from '../sequence/index.ts'

describe('SequenceComparer', () => {
  describe('local', () => {
    const epochA = '0000000000000001' as Epoch
    const epochB = '0000000000000002' as Epoch

    const nonceX = '000000000000000a' as Nonce
    const nonceY = '000000000000000b' as Nonce

    const seqAX: Sequence = SequenceParser.from(epochA, nonceX).localSequence // local sequence #1
    const seqAY: Sequence = SequenceParser.from(epochA, nonceY).localSequence // local sequence #2
    const seqBX: Sequence = SequenceParser.from(epochB, nonceX).localSequence // local sequence #3

    it('should return 0 when local sequences are equal', () => {
      expect(SequenceComparer.local(seqAX, seqAX)).toBe(0)
    })

    it('should return a negative number if first local sequence < second by local sequence value', () => {
      // Compare seqAX to seqAY (they differ in nonce)
      const result = SequenceComparer.local(seqAX, seqAY)
      expect(result).toBeLessThan(0)
    })

    it('should return a positive number if first local sequence > second by local sequence value', () => {
      // Compare seqAY to seqAX (they differ in nonce)
      const result = SequenceComparer.local(seqAY, seqAX)
      expect(result).toBeGreaterThan(0)
    })

    it('should consider epoch differences if nonce is the same', () => {
      // seqAX vs seqBX differ by epoch
      const result = SequenceComparer.local(seqAX, seqBX)
      expect(result).toBeLessThan(0)

      const reverseResult = SequenceComparer.local(seqBX, seqAX)
      expect(reverseResult).toBeGreaterThan(0)
    })
  })

  describe('qualified', () => {
    const epochC = '0000000000000010' as Epoch
    const epochD = '0000000000000011' as Epoch

    const nonceM = '000000000000000f' as Nonce
    const nonceN = '000000000000001f' as Nonce

    const address1 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address
    const address2 = '0000000000000000000000000000000000000000' as Address

    const seqCMA: Sequence = SequenceParser.from(epochC, nonceM, address1).qualifiedSequence // qualified seq #1
    const seqCNA: Sequence = SequenceParser.from(epochC, nonceN, address1).qualifiedSequence // qualified seq #2
    const seqDMB: Sequence = SequenceParser.from(epochD, nonceM, address2).qualifiedSequence // qualified seq #3

    it('should return 0 when qualified sequences are equal', () => {
      expect(SequenceComparer.qualified(seqCMA, seqCMA)).toBe(0)
    })

    it('should return a negative number if the first qualified sequence < second by full sequence value', () => {
      // Compare sequences differing by nonce
      const result = SequenceComparer.qualified(seqCMA, seqCNA)
      expect(result).toBeLessThan(0)
    })

    it('should return a positive number if the first qualified sequence > second by full sequence value', () => {
      // Compare reversed
      const result = SequenceComparer.qualified(seqCNA, seqCMA)
      expect(result).toBeGreaterThan(0)
    })

    it('should consider address differences if epoch and nonce are identical', () => {
      // Create two sequences differing only by address
      const seqCMA2 = SequenceParser.from(epochC, nonceM, address2).qualifiedSequence
      const result = SequenceComparer.qualified(seqCMA, seqCMA2)
      // Since address1 ('a...') > address2 ('0...'), we expect a positive result
      expect(result).toBeGreaterThan(0)
    })

    it('should consider epoch differences', () => {
      // seqCMA vs seqDMB differ by epoch
      const result = SequenceComparer.qualified(seqCMA, seqDMB)
      expect(result).toBeLessThan(0)

      const reverseResult = SequenceComparer.qualified(seqDMB, seqCMA)
      expect(reverseResult).toBeGreaterThan(0)
    })
  })
})
