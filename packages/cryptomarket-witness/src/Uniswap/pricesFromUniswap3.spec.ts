import { InfuraProvider } from '@ethersproject/providers'

import { pricesFromUniswap3, uniswapPoolContracts } from './pricesFromUniswap3'

describe('procesFromUniswap3', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const pairs = await pricesFromUniswap3(uniswapPoolContracts(provider))
    expect(pairs.length).toBeGreaterThan(1)
  })
})
