import { describeIf } from '@xylabs/jest-helpers'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { getNftsOwnedByAddressWithMetadata } from '../getNftsOwnedByAddress'

type TestData = [chainName: string, address: string, chainId: number]

describeIf(process.env.INFURA_PROJECT_ID)('getNftsOwnedByAddressWithMeta', () => {
  const testData: TestData[] = [
    ['Ethereum Mainnet', '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a', 1],
    //['Ethereum Mainnet', '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1],
    //['Polygon Mainnet', '0x5ABa56bF7eeB050796e14504c8547e0f6cA1d794', 137],
  ]
  it.each(testData)('gets NFTs owned by the address on %s', async (_chainName, address, chainId) => {
    const start = Date.now()
    const provider = getProviderFromEnv(chainId)
    const nfts = await getNftsOwnedByAddressWithMetadata(address, [provider], 200)
    expect(nfts.length).toBeGreaterThan(0)
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      expect(nft.address).toBeString()
      expect(nft.supply).toBeString()
      if (nft?.metadata) {
        expect(nft.metadata).toBeObject()
      }
      expect(nft.types).toBeArray()
    }
    console.log(`getNftsOwnedByAddressWithMeta [${nfts.length}] Time: ${Date.now() - start}ms`)
    console.log(`getNftsOwnedByAddressWithMeta ${JSON.stringify(nfts, null, 2)}`)
  })
})
