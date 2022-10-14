// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'

import { UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoUniswapCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = new XyoUniswapCryptoMarketWitness({
      provider,
    })
    await witness.initialize({
      pools: UniswapPoolContracts,
      schema: XyoUniswapCryptoMarketWitnessConfigSchema,
      targetSchema: XyoUniswapCryptoMarketSchema,
    })
    const [observation] = await witness.observe()
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)
  })
})
