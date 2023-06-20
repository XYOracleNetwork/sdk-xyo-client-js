import { InfuraProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'

import { createUniswapPoolContracts } from '../Ethers'
import { pricesFromUniswap3 } from '../pricesFromUniswap3'
import { UniswapPoolContracts } from '../UniswapPoolContracts'

describeIf(process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET)('pricesFromUniswap3', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const pairs = await pricesFromUniswap3(createUniswapPoolContracts(provider, UniswapPoolContracts))
    expect(pairs.length).toBeGreaterThan(1)
  })
})
