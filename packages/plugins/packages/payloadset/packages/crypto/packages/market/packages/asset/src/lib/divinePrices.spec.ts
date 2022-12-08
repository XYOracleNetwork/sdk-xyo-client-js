import { sampleCoinGeckoPayload, sampleUniswapPayload } from '../test'
import { divinePrices } from './divinePrices'

describe('divinePrices', () => {
  it('divines prices', () => {
    const result = divinePrices(sampleCoinGeckoPayload, sampleUniswapPayload)
    expect(result).toBeObject()
    expect(result.timestamp).toBeNumber()
    expect(result.assets.xyo?.value.btc).toBe('6.415295e-7')
    expect(result.assets.xyo?.value.eth).toBe('0.000008908865')
    expect(result.assets.xyo?.value.eur).toBe('0.01417995')
    expect(result.assets.xyo?.value.usd).toBe('0.014635635000000001')
  })
})
