import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { scoreTotal } from '../total'

describe('scoreTotal', () => {
  const collections: NftCollectionInfo[] = [
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 1,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 10,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 100,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 1000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 2000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 3000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 10000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 20000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 30000,
    },
    {
      address: '0x0000000000',
      chainId: 1,
      name: 'test',
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 100000,
    },
  ]

  it.each(collections)('scores the total', (collection) => {
    const [total, possible] = scoreTotal(collection)
    expect(total).toBeNumber()
    expect(total).not.toBeNegative()
    expect(possible).toBeNumber()
    expect(possible).not.toBeNegative()
  })
})
