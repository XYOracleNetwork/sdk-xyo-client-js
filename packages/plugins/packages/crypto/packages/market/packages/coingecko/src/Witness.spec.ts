import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoingeckoCryptoMarketWitness({
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketWitnessConfigSchema,
        targetSchema: XyoCoingeckoCryptoMarketSchema,
      },
    })
    const [actual] = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketSchema)
  })
})
