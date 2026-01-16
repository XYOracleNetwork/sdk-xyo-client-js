import {
  describe, expect, it,
} from 'vitest'

import { SignedBoundWitnessZod } from '../SignedBoundWitness.ts'

const unsignedBoundWitness = [
  {
    $signatures: [],
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
  },
]

const signedBoundWitness = {
  schema: 'network.xyo.boundwitness',
  addresses: [
    'ead7b84244eb0f8c3ba762c4e02c1ae34cf16935',
  ],
  payload_hashes: [
    '0f888bccfb48bb51ecc384218e558b19e33f41cf0f000109f9b89ed1f2942746',
    '1a9b43290da3c1ee9eb89008b319233c8a3c1feeea90e4e45c0caa0912105e7d',
  ],
  payload_schemas: [
    'network.xyo.boundwitness',
    'network.xyo.stock.market.tzero.snapshot',
  ],
  previous_hashes: [
    null,
  ],
  $signatures: [
    '1fec35c0aef4109809e7f4df80386ad63acc2a4f87435a0ff1f898c2dc9232d43b8a8c73ffa6cb60e4dbf5806526305c9c1ecd969013f45bb51317fd020c321e',
  ],
  nbf: 605_901,
  exp: 606_901,
  fees: {
    base: 'e8d4a51000',
    gasLimit: '038d7ea4c68000',
    gasPrice: '02540be400',
    priority: '00',
  },
  chain: '319e667ced10452a117472811130444ded357f26',
  from: 'ead7b84244eb0f8c3ba762c4e02c1ae34cf16935',
}

describe('SignedBoundWitness', () => {
  it('should flag invalid SignedBoundWitness', () => {
    expect(SignedBoundWitnessZod.safeParse(unsignedBoundWitness[0]).success).toBe(false)
  })
  it('should validate SignedBoundWitness', () => {
    expect(SignedBoundWitnessZod.safeParse(signedBoundWitness).success).toBe(true)
  })
})
