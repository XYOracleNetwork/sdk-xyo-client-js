import { NftAttribute } from '@xyo-network/crypto-nft-payload-plugin'

import { evaluateAttributes } from '../evaluateAttributes'

const attributes: NftAttribute[][] = [
  [
    {
      display_type: 'date',
      trait_type: 'Created Date',
      value: null,
    },
    {
      display_type: 'number',
      trait_type: 'Length',
      value: 8,
    },
    {
      display_type: 'date',
      trait_type: 'Registration Date',
      value: 1640668437000,
    },
    {
      display_type: 'date',
      trait_type: 'Expiration Date',
      value: 1956237957000,
    },
  ],
  [
    {
      display_type: 'date',
      trait_type: 'Publish Date',
      value: 1643274000,
    },
    {
      trait_type: 'Edition',
      value: 'Bridge',
    },
    {
      trait_type: 'Inventory',
      value: 'Artifacts',
    },
  ],
  [
    {
      trait_type: 'Artist',
      value: 'MrSnowy10',
    },
    {
      trait_type: 'Item Eaten',
      value: 'Radioactive Waste',
    },
    {
      trait_type: 'Type',
      value: 'Avatar',
    },
    {
      trait_type: 'Species',
      value: 'Pinco',
    },
  ],
]

describe('evaluateAttributes', () => {
  describe('evaluateAttributes', () => {
    it.each(attributes)('evaluates the attributes', (...value) => {
      const score = evaluateAttributes(value)
      const [amount, possible] = score
      expect(amount).toBeNumber()
      expect(amount).toBePositive()
      expect(possible).toBeNumber()
      expect(possible).toBePositive()
      expect(amount).toBeGreaterThanOrEqual(possible)
    })
  })
})
