import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketQueryPayloadSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoingeckoCryptoMarketWitness({
      query: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketQueryPayloadSchema,
        targetSchema: XyoCoingeckoCryptoMarketPayloadSchema,
      },
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketPayloadSchema)
  })
})
