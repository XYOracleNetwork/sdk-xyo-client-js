import { defaultCoins, defaultCurrencies } from './defaults'
import { XyoCoinGeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoinGeckoCryptoMarketWitness({
      query: { coins: defaultCoins, currencies: defaultCurrencies, schema: 'network.xyo.crypto.market.coingecko.query', targetSchema: 'network.xyo.crypto.market.coingecko' },
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe('network.xyo.crypto.market.coingecko')
  })
})
