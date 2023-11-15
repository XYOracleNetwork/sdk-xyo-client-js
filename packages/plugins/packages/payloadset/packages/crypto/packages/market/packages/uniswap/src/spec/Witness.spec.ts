// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { Account } from '@xyo-network/account'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { UniswapCryptoMarketPayload, UniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { UniswapPoolContracts } from '../lib'
import { UniswapCryptoMarketWitness } from '../Witness'

describe('UniswapCryptoMarketWitness', () => {
  test('observe', async () => {
    const provider = getProviderFromEnv()
    const witness = await UniswapCryptoMarketWitness.create({
      account: Account.randomSync(),
      config: {
        pools: UniswapPoolContracts,
        schema: UniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as UniswapCryptoMarketPayload[]
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
  test('observe [no config]', async () => {
    const provider = getProviderFromEnv()
    const witness = await UniswapCryptoMarketWitness.create({
      account: Account.randomSync(),
      config: {
        pools: UniswapPoolContracts,
        schema: UniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as UniswapCryptoMarketPayload[]
    expect(observation.pairs.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
  test('observe [no params]', async () => {
    const didThrow = async () => {
      try {
        await UniswapCryptoMarketWitness.create({ account: Account.randomSync() })
        return false
      } catch {
        return true
      }
    }
    expect(await didThrow()).toBe(true)
  })
})
