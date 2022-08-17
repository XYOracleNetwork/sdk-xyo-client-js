import { assertEx } from '@xylabs/sdk-js'

import { sampleCoinGeckoPayload } from '../test'
import { divineCoinGeckoPrices } from './divineCoinGeckoPrices'

describe('divineCoinGeckoPrices', () => {
  it('divines prices from CoinGecko', () => {
    const result = divineCoinGeckoPrices(sampleCoinGeckoPayload)
    expect(result.assets).toBeObject()
    const assets = assertEx(result.assets)
    Object.entries(assets).map(([token, assetInfo]) => {
      expect(token).toBeString()
      expect(assetInfo).toBeObject()
      const value = assertEx(assetInfo?.value)
      expect(value).toBeObject()
      Object.entries(value).map(([symbol, price]) => {
        expect(symbol).toBeString()
        expect(price).toBeString()
        const parsed = parseFloat(price)
        expect(parsed).toBeNumber()
        expect(isNaN(parsed)).toBeFalse()
      })
    })
    expect(result?.assets?.xyo?.value?.btc).toBe('6.28282e-7')
    expect(result?.assets?.xyo?.value?.eth).toBe('0.00000885')
    expect(result?.assets?.xyo?.value?.eur).toBe('0.01417995')
    expect(result?.assets?.xyo?.value?.usd).toBe('0.01439307')
  })
})
