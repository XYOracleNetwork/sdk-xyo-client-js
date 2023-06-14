import { CoingeckoCryptoMarketPayload, CoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { defaultCoins, defaultCurrencies } from '../lib'
import { CoingeckoCryptoMarketWitnessConfigSchema } from '../Schema'
import { CoingeckoCryptoMarketWitness } from '../Witness'

describe('CoingeckoCryptoMarketWitness', () => {
  test('returns observation', async () => {
    const sut = await CoingeckoCryptoMarketWitness.create({
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: CoingeckoCryptoMarketWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.schema).toBe(CoingeckoCryptoMarketSchema)
    const answerWrapper = PayloadWrapper.wrap(actual) as PayloadWrapper<CoingeckoCryptoMarketPayload>
    expect(await answerWrapper.getValid()).toBe(true)
    expect(answerWrapper.body().assets).toBeObject()
    const assets = Object.keys(answerWrapper.body().assets)
    expect(assets).toBeArray()
    expect(assets.length).toBeGreaterThan(0)
  })

  test('returns observation [no config]', async () => {
    const sut = await CoingeckoCryptoMarketWitness.create()
    const [actual] = await sut.observe()
    expect(actual.schema).toBe(CoingeckoCryptoMarketSchema)
    const answerWrapper = PayloadWrapper.wrap(actual) as PayloadWrapper<CoingeckoCryptoMarketPayload>
    expect(await answerWrapper.getValid()).toBe(true)
    expect(answerWrapper.body().assets).toBeObject()
    const assets = Object.keys(answerWrapper.body().assets)
    expect(assets).toBeArray()
    expect(assets.length).toBe(0)
  })
})
