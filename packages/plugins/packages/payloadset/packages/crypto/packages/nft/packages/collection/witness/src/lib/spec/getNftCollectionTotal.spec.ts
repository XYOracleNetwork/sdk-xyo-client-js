import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'

import { getNftCollectionTotalNfts } from '../getNftCollectionTotalNfts'

describeIf(process.env.INFURA_PROJECT_ID)('getNftCollectionInfo', () => {
  const cases: [address: string, chainId: number, expected: number][] = [
    ['0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1, 10_000],
    ['0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', 1, 9999],
  ]
  it.each(cases)('gets NFTs owned by the address', async (address, chainId, expected) => {
    const { privateKey } = await HDWallet.random()
    const result = await getNftCollectionTotalNfts(address, chainId, privateKey)
    expect(result).toBeNumber()
    expect(result).toEqual(expected)
  })
})
