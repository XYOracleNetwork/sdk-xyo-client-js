import { NftCollectionInfoPayload, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { analyzeNftCollection } from '../analyzeNftCollection'

const collections: NftCollectionInfoPayload[] = [
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 1,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 10,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 100,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 1000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 2000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 3000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 10000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 20000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 30000,
  },
  {
    address: '0x0000000000',
    chainId: 1,
    name: 'test',
    schema: NftCollectionSchema,
    symbol: 'TEST',
    tokenType: 'ERC721',
    total: 100000,
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
