import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { defaultCoins, defaultCurrencies } from '../lib'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from '../Schema'
import { XyoCoingeckoCryptoMarketWitness } from '../Witness'

describe('XyoCoingeckoCryptoMarketWitness', () => {
  test('returns observation', async () => {
    const sut = await XyoCoingeckoCryptoMarketWitness.create({
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketSchema)
    const answerWrapper = new PayloadWrapper(actual) as PayloadWrapper<XyoCoingeckoCryptoMarketPayload>
    expect(await answerWrapper.getValid()).toBe(true)
    expect(answerWrapper.body().assets).toBeObject()
    const assets = Object.keys(answerWrapper.body().assets)
    expect(assets).toBeArray()
    expect(assets.length).toBeGreaterThan(0)
  })

  test('returns observation [no config]', async () => {
    const sut = await XyoCoingeckoCryptoMarketWitness.create()
    const [actual] = await sut.observe()
    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketSchema)
    const answerWrapper = new PayloadWrapper(actual) as PayloadWrapper<XyoCoingeckoCryptoMarketPayload>
    expect(await answerWrapper.getValid()).toBe(true)
    expect(answerWrapper.body().assets).toBeObject()
    const assets = Object.keys(answerWrapper.body().assets)
    expect(assets).toBeArray()
    expect(assets.length).toBe(0)
  })
})
