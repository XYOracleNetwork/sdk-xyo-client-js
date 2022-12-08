import { InfuraProvider } from '@ethersproject/providers'

import { createUniswapPoolContracts } from './Ethers'
import { pricesFromUniswap3 } from './pricesFromUniswap3'
import { UniswapPoolContracts } from './UniswapPoolContracts'

describe('pricesFromUniswap3', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const pairs = await pricesFromUniswap3(createUniswapPoolContracts(provider, UniswapPoolContracts))
    expect(pairs.length).toBeGreaterThan(1)
  })
})
