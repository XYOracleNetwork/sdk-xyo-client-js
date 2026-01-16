import {
  describe, expect, it,
} from 'vitest'

import { SignedBoundWitnessZod } from '../SignedBoundWitness.ts'
import { UnsignedBoundWitnessZod } from '../UnsignedBoundWitness.ts'

const unsignedBoundWitness = {
  $signatures: [] as (string | null)[],
  addresses: [],
  payload_hashes: [
    '01bbcd4c58fd88488882ba54e13e92603f13c34695eda64780502acc80c3fcc1',
    'ff127a824dc672ff5b7a32d2c7deffcdde3cc417ad112510532f24a2e948516a',
    '92693e6fefeed94eb80872ba9e2c86d7861fc84e4bc5b775ebe9966e68c26767',
    '85009387d332dffa781bbf6fa107715f36f9d6b3294c5cc8fd1ce8ada207d2bb',
  ],
  payload_schemas: [
    'network.xyo.hash',
    'network.xyo.hash',
    'network.xyo.id',
    'network.xyo.id',
  ],
  previous_hashes: [],
  schema: 'network.xyo.boundwitness',
}

describe('BoundWitness', () => {
  describe('Signed', () => {
    it('should validate SignedBoundWitness', () => {
      const signedBoundWitness = structuredClone(unsignedBoundWitness)
      signedBoundWitness.$signatures = [
        '1fec35c0aef4109809e7f4df80386ad63acc2a4f87435a0ff1f898c2dc9232d43b8a8c73ffa6cb60e4dbf5806526305c9c1ecd969013f45bb51317fd020c321e',
        '1fec35c0aef4109809e7f4df80386ad63acc2a4f87435a0ff1f898c2dc9232d43b8a8c73ffa6cb60e4dbf5806526305c9c1ecd969013f45bb51317fd020c321e',
      ]
      expect(signedBoundWitness.$signatures.length).toBe(2)
      expect(SignedBoundWitnessZod.safeParse(signedBoundWitness).success).toBe(true)
    })
    it('should catch invalid SignedBoundWitness', () => {
      const unsignedBoundWitnessClone = structuredClone(unsignedBoundWitness)
      unsignedBoundWitnessClone.$signatures = []
      expect(SignedBoundWitnessZod.safeParse(unsignedBoundWitnessClone).success).toBe(false)
      // test with invalid signatures
      const invalidSignedBoundWitness = structuredClone(unsignedBoundWitness)
      invalidSignedBoundWitness.$signatures = ['invalidSignature']
      expect(SignedBoundWitnessZod.safeParse(invalidSignedBoundWitness).success).toBe(false)
    })
  })
  describe('Unsigned', () => {
    it('should validate UnsignedBoundWitness', () => {
      const unsignedBoundWitnessClone = structuredClone(unsignedBoundWitness)
      unsignedBoundWitnessClone.$signatures = [null, null]
      expect(UnsignedBoundWitnessZod.safeParse(unsignedBoundWitnessClone).success).toBe(true)
    })
    it('should catch invalid UnsignedSignedBoundWitness', () => {
      // Unsure of the fallout for enforcing at least one null signature in an unsigned bound witness
      // const invalidUnSignedBoundWitness = structuredClone(unsignedBoundWitness)
      // invalidUnSignedBoundWitness.$signatures = []
      // expect(UnsignedBoundWitnessZod.safeParse(invalidUnSignedBoundWitness).success).toBe(false)

      const anotherInvalidUnSignedBoundWitness = structuredClone(unsignedBoundWitness)
      anotherInvalidUnSignedBoundWitness.$signatures = [null, 'invalidSignature']
      expect(UnsignedBoundWitnessZod.safeParse(anotherInvalidUnSignedBoundWitness).success).toBe(false)
    })
  })
})
