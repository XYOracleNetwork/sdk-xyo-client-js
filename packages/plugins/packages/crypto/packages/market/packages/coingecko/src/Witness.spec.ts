import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoingeckoCryptoMarketWitness({
      coins: defaultCoins,
      currencies: defaultCurrencies,
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketSchema)
  })
})
