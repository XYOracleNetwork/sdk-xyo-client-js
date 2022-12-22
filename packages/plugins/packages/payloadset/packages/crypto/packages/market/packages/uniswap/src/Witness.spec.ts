// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketWitness } from './Witness'

describe('XyoUniswapCryptoMarketWitness', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = await XyoUniswapCryptoMarketWitness.create({
      config: {
        pools: UniswapPoolContracts,
        schema: XyoUniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as XyoUniswapCryptoMarketPayload[]
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = new PayloadWrapper(observation)
    expect(answerWrapper.valid).toBe(true)
  })
  test('observe [no config]', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = await XyoUniswapCryptoMarketWitness.create({
      config: {
        pools: UniswapPoolContracts,
        schema: XyoUniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as XyoUniswapCryptoMarketPayload[]
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = new PayloadWrapper(observation)
    expect(answerWrapper.valid).toBe(true)
  })
  test('observe [no params]', async () => {
    const didThrow = async () => {
      try {
        await XyoUniswapCryptoMarketWitness.create()
        return false
      } catch {
        return true
      }
    }
    expect(await didThrow()).toBe(true)
  })
})
