import { InfuraProvider } from '@ethersproject/providers'

import { pricesFromUniswap3 } from './pricesFromUniswap3'

describe('procesFromUniswap3', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const pairs = await pricesFromUniswap3(provider)
    console.log(`Pairs: ${JSON.stringify(pairs, null, 2)}`)
    expect(pairs.length).toBeGreaterThan(1)
  })
})
