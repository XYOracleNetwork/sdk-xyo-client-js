// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { XyoAccount } from '@xyo-network/account'

import { UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayloadSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoUniswapCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = new XyoUniswapCryptoMarketWitness({
      account: new XyoAccount(),
      pools: UniswapPoolContracts,
      provider,
      schema: XyoUniswapCryptoMarketWitnessConfigSchema,
      targetSchema: XyoUniswapCryptoMarketPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)
  })
})
