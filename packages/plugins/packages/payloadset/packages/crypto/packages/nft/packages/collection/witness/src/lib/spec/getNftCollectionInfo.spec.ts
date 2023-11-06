import { describeIf } from '@xylabs/jest-helpers'
import { NftCollectionMetadata } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { getNftCollectionNfts } from '../getNftCollectionNfts'

type Expected = Omit<Omit<NftCollectionMetadata, 'address'>, 'chainId'>

describeIf(process.env.INFURA_PROJECT_ID)('getNftCollectionMetadata', () => {
  const cases: [address: string, chainId: number, expected: Expected][] = [
    [
      '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      1,
      {
        name: 'CRYPTOPUNKS',
        symbol: 'Ͼ',
        type: 'ERC721',
      },
    ],
    [
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      1,
      {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        type: 'ERC721',
      },
    ],
    [
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      1,
      {
        name: 'MutantApeYachtClub',
        symbol: 'MAYC',
        type: 'ERC721',
      },
    ],
    [
      '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
      1,
      {
        name: 'Azuki',
        symbol: 'AZUKI',
        type: 'ERC721',
      },
    ],
    [
      '0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a',
      1,
      {
        name: 'Art Blocks',
        symbol: 'BLOCKS',
        type: 'ERC721',
      },
    ],
  ]

  it.each(cases)('gets NFTs owned by the address', async (address, chainId, expected) => {
    const info: NftCollectionMetadata = { ...expected, address, chainId }
    const result = await getNftCollectionNfts(address, chainId)
    expect(result).toBeObject()
    expect(result).toEqual(info)
  })
})
