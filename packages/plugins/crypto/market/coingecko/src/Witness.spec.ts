import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCryptoMarketCoinGeckoPayloadSchema, XyoCryptoMarketCoinGeckoQueryPayloadSchema } from './Schema'
import { XyoCoinGeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoinGeckoCryptoMarketWitness({
      query: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCryptoMarketCoinGeckoQueryPayloadSchema,
        targetSchema: XyoCryptoMarketCoinGeckoPayloadSchema,
      },
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe(XyoCryptoMarketCoinGeckoPayloadSchema)
  })
})
