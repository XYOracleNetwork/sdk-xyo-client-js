import { ExternalProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { HttpProvider } from 'web3-providers-http'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

describeIf(process.env.INFURA_PROJECT_ID)('getNftsOwnedByAddress', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  const network = 'homestead'
  const apiKey = process.env.INFURA_PROJECT_ID
  const { sendAsync, ...provider } = new HttpProvider(`https://${network}.infura.io/v3/${apiKey}`)
  test('observe', async () => {
    const nfts = await getNftsOwnedByAddress(address, chainId, provider)
    expect(nfts.length).toBeGreaterThan(1)
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
