import { describeIf } from '@xylabs/jest-helpers'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

describeIf(process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET)('getNftsOwnedByAddress', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  test('observe', async () => {
    const pairs = await getNftsOwnedByAddress(address, chainId)
    expect(pairs.length).toBeGreaterThan(1)
  })
})
