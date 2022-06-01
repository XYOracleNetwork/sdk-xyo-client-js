import { pricesFromUniswap3 } from './pricesFromUniswap3'

describe('procesFromUniswap3', () => {
  test('observe', async () => {
    const assets = await pricesFromUniswap3()
    expect(assets.btc?.btc).toBe(1)
  })
})
