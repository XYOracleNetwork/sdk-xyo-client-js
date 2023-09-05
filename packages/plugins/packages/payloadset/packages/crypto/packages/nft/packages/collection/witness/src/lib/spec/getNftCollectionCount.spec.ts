import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'

import { getNftCollectionCount } from '../getNftCollectionCount'

describeIf(process.env.INFURA_PROJECT_ID)('getNftCollectionCount', () => {
  const cases: [address: string, chainId: number, expected: number][] = [
    ['0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', 1, 9999],
    ['0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1, 10_000],
    ['0x60E4d786628Fea6478F785A6d7e704777c86a7c6', 1, 19_481],
    ['0xED5AF388653567Af2F388E6224dC7C4b3241C544', 1, 10_000],
    ['0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a', 1, 11_010],
  ]
  let privateKey = ''
  beforeAll(async () => {
    const wallet = await HDWallet.random()
    privateKey = wallet.privateKey
  })
  it.each(cases)('gets NFTs owned by the address', async (address, chainId, expected) => {
    const result = await getNftCollectionCount(address, chainId, privateKey)
    expect(result).toBeNumber()
    expect(result).toEqual(expected)
  })
})
