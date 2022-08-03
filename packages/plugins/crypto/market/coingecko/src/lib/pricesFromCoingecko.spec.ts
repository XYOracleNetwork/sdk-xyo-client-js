import { defaultCoins, defaultCurrencies } from './defaults'
import { pricesFromCoingecko } from './pricesFromCoingecko'

describe('pricesFromCoingecko', () => {
  test('observe', async () => {
    const assets = await pricesFromCoingecko(defaultCoins, defaultCurrencies)
    expect(assets.btc?.btc).toBe(1)
  })
})
