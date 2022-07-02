// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'

import { UniswapPoolContracts } from './pricesFromUniswap3'
import { XyoUniswapCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = new XyoUniswapCryptoMarketWitness(
      { pools: UniswapPoolContracts, schema: XyoUniswapCryptoMarketWitness.schema, targetSchema: XyoUniswapCryptoMarketWitness.schema },
      provider
    )
    const observation = await witness.observe()
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)
  }, 120000)
})
