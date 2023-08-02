import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'

import { getNftCollectionInfo } from '../getNftCollectionInfo'

describeIf(process.env.INFURA_PROJECT_ID)('getNftCollectionInfo', () => {
  const address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
  const chainId = 1
  test('gets NFTs owned by the address', async () => {
    const { privateKey } = await HDWallet.random()
    const result = await getNftCollectionInfo(address, chainId, privateKey)
    expect(result).toBeObject()
    expect(result).toEqual({
      address,
      chainId,
      name: 'BoredApeYachtClub',
      schema: 'network.xyo.crypto.nft.collection',
      symbol: 'BAYC',
      tokenType: 'ERC721',
    })
  })
})
