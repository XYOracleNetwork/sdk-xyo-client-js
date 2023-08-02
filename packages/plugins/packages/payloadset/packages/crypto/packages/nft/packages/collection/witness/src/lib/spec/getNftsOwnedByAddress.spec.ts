import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

describeIf(process.env.INFURA_PROJECT_ID)('getNftsOwnedByAddress', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  test('gets NFTs owned by the address', async () => {
    const { privateKey } = await HDWallet.random()
    const nfts = await getNftsOwnedByAddress(address, chainId, privateKey)
    expect(nfts.length).toBeGreaterThan(0)
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      expect(nft.contract).toBeString()
      expect(nft.supply).toBeString()
      if (nft?.metadata) {
        expect(nft.metadata).toBeObject()
      }
      expect(nft.tokenId).toBeString()
      expect(nft.type).toBeString()
    }
  })
})
