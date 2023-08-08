import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { getNftCollectionInfo } from '../getNftCollectionInfo'

type Expected = Omit<Omit<Omit<NftCollectionInfo, 'address'>, 'chainId'>, 'total'>

describeIf(process.env.INFURA_PROJECT_ID)('getNftCollectionInfo', () => {
  const cases: [address: string, chainId: number, expected: Expected][] = [
    [
      '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      1,
      {
        name: 'CRYPTOPUNKS',
        symbol: 'Ͼ',
        tokenType: null,
      },
    ],
    [
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      1,
      {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        tokenType: 'ERC721',
      },
    ],
    [
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      1,
      {
        name: 'MutantApeYachtClub',
        symbol: 'MAYC',
        tokenType: 'ERC721',
      },
    ],
    [
      '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
      1,
      {
        name: 'Azuki',
        symbol: 'AZUKI',
        tokenType: 'ERC721',
      },
    ],
  ]
  let privateKey = ''
  beforeAll(async () => {
    const wallet = await HDWallet.random()
    privateKey = wallet.privateKey
  })
  it.each(cases)('gets NFTs owned by the address', async (address, chainId, expected) => {
    const info: Omit<NftCollectionInfo, 'total'> = { ...expected, address, chainId }
    const result = await getNftCollectionInfo(address, chainId, privateKey)
    expect(result).toBeObject()
    expect(result).toEqual(info)
  })
})
