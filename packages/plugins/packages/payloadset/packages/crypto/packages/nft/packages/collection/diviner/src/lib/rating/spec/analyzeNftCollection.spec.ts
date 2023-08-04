import { NftCollectionInfo, NftCollectionInfoPayload, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { analyzeNftCollection } from '../analyzeNftCollection'

const collections: NftCollectionInfoPayload[] = [
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 1000,
  },
]

describe('analyzeNftCollection', () => {
  it.each(collections)('evaluates the NFT collection', async (collection) => {
    const rating = await analyzeNftCollection(collection)
    expect(rating).toBeObject()
    Object.entries(rating).map(([key, score]) => {
      expect(key).toBeString()
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).not.toBeNegative()
      expect(possible).toBeNumber()
      expect(possible).not.toBeNegative()
      expect(total).toBeLessThanOrEqual(possible)
    })
  })
})
