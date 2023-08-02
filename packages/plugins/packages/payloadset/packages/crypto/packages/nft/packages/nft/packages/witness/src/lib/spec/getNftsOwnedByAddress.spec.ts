import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

type TestData = [chainName: string, address: string, chainId: number]

describeIf(process.env.INFURA_PROJECT_ID)('getNftsOwnedByAddress', () => {
  const testData: TestData[] = [
    ['Ethereum Mainnet', '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a', 1],
    ['Polygon Mainnet', '0x5ABa56bF7eeB050796e14504c8547e0f6cA1d794', 137],
  ]
  it.each(testData)('gets NFTs owned by the address on %s', async (_chainName, address, chainId) => {
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
