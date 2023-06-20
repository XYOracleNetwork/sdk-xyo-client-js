import { InfuraProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'

import { getNftsOwnedByAddress } from '../getNftsOwnedByAddress'

describeIf(process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET)('getNftsOwnedByAddress', () => {
  test.todo('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const pairs = await getNftsOwnedByAddress('0x000000', 'chain', '0x000000', provider)
    expect(pairs.length).toBeGreaterThan(1)
  })
})
