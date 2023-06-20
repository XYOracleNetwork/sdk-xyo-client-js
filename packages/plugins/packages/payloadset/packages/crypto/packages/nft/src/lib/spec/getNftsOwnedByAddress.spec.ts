import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

describeIf(process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET)('getNftsOwnedByAddress', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  const isStringOrNull = (value: never) => typeof value === 'string' || value === null
  const account = Account.random()
  test('observe', async () => {
    const nfts = await getNftsOwnedByAddress(address, chainId, account.private.hex)
    expect(nfts.length).toBeGreaterThan(1)
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      expect(nft.contract).toBeString()
      expect(nft.name).toSatisfy(isStringOrNull)
      expect(nft.symbol).toSatisfy(isStringOrNull)
      expect(nft.tokenType).toBeString()
    }
  })
})
