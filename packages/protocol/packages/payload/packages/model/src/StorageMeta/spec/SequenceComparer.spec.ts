// SequenceComparer.spec.ts

import {
  describe, expect, it,
} from 'vitest'

import type { Sequence } from '../Sequence.ts'
import { SequenceComparer } from '../SequenceComparer.ts'
import { SequenceParser } from '../SequenceParser.ts'

// Utility function to create a sequence for testing
// The details here depend on how SequenceParser expects sequences to be formed.
// For simplicity, we'll assume `epoch` (4 bytes), `nonce` (4 bytes), and `address` (20 bytes)
// as part of a qualified sequence, total 28 bytes => 56 hex chars.
// For a local sequence (without address), assume a smaller length.
// Adjust these constants and examples as per your SequenceConstants.
function createSequence(epochHex: string, nonceHex: string, addressHex?: string): Sequence {
  // Construct a hex string representing the sequence
  // Adjust lengths and concatenation logic as needed.
  const seqHex = epochHex + nonceHex + (addressHex ?? '')
  return seqHex as Sequence
}

describe('SequenceComparer', () => {
  describe('local', () => {
    // We'll test local sequences that only have epoch + nonce, no address.
    // Adjust lengths as per your SequenceConstants.
    const epochA = '00000001' // Represents a small epoch value
    const epochB = '00000002' // A larger epoch value
    const nonceX = '0000000a' // Example nonce
    const nonceY = '0000000b' // Another nonce

    const seqAX = createSequence(epochA, nonceX) // local sequence #1
    const seqAY = createSequence(epochA, nonceY) // local sequence #2
    const seqBX = createSequence(epochB, nonceX) // local sequence #3

    it('should return 0 when local sequences are equal', () => {
      // Same exact sequence
      expect(SequenceComparer.local(seqAX, seqAX)).toBe(0)
    })

    it('should return a negative number if first local sequence < second by local sequence value', () => {
      // Compare seqAX to seqAY, differ by nonce
      const result = SequenceComparer.local(seqAX, seqAY)
      expect(result).toBeLessThan(0)
    })

    it('should return a positive number if first local sequence > second by local sequence value', () => {
      // Compare seqAY to seqAX, differ by nonce
      const result = SequenceComparer.local(seqAY, seqAX)
      expect(result).toBeGreaterThan(0)
    })

    it('should consider epoch differences if nonce is same', () => {
      // seqAX vs seqBX differ by epoch
      const result = SequenceComparer.local(seqAX, seqBX)
      expect(result).toBeLessThan(0)

      const reverseResult = SequenceComparer.local(seqBX, seqAX)
      expect(reverseResult).toBeGreaterThan(0)
    })
  })

  describe('qualified', () => {
    // For qualified sequences, we add an address component.
    // Adjust the lengths as needed to form a valid qualified sequence:
    // epoch: 4 bytes (8 hex chars), nonce: 4 bytes (8 hex chars), address: 20 bytes (40 hex chars)
    const epochC = '00000010'
    const epochD = '00000011'
    const nonceM = '0000000f'
    const nonceN = '0000001f'
    const address1 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // 20 bytes of 0xaa
    const address2 = '0000000000000000000000000000000000000000' // 20 bytes of 0x00

    const seqCMA = createSequence(epochC, nonceM, address1) // qualified seq #1
    const seqCNA = createSequence(epochC, nonceN, address1) // qualified seq #2
    const seqDMB = createSequence(epochD, nonceM, address2) // qualified seq #3

    it('should return 0 when qualified sequences are equal', () => {
      expect(SequenceComparer.qualified(seqCMA, seqCMA)).toBe(0)
    })

    it('should return a negative number if the first qualified sequence < second by full sequence value', () => {
      // Compare sequences differing by nonce
      const result = SequenceComparer.qualified(seqCMA, seqCNA)
      expect(result).toBeLessThan(0)
    })

    it('should return a positive number if the first qualified sequence > second by full sequence value', () => {
      // Compare reversed arguments from above test
      const result = SequenceComparer.qualified(seqCNA, seqCMA)
      expect(result).toBeGreaterThan(0)
    })

    it('should consider address differences if epoch and nonce are identical', () => {
      // Create two sequences differing only by address
      const seqCMA2 = createSequence(epochC, nonceM, address2)
      const result = SequenceComparer.qualified(seqCMA, seqCMA2)
      // The result depends on the lex order of address1 vs address2
      // Here, 'address1' (all 'a') > 'address2' (all '0'), so expect a > result
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
