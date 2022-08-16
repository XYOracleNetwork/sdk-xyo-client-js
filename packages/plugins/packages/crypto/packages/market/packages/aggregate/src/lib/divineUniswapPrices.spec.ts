import { sampleUniswapPayload } from '../test'
import { divineUniswapPrices } from './divineUniswapPrices'

describe('divineUniswapPrices', () => {
  it('divines prices from Uniswap', () => {
    const result = divineUniswapPrices(sampleUniswapPayload)
    expect(result).toBeObject()
    expect(result?.assets?.xyo?.value?.btc).toBe('6.54777e-7')
    expect(result?.assets?.xyo?.value?.eth).toBe('0.00000896773')
    expect(result?.assets?.xyo?.value?.eur).toBe(undefined)
    expect(result?.assets?.xyo?.value?.usd).toBe('0.0148782')
  })
})
