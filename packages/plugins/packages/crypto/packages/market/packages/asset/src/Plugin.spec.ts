import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoMarketAssetPlugin } from './Plugin'
import { XyoCryptoMarketAssetSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoCryptoMarketAssetPlugin())
    expect(resolver.resolve({ schema: XyoCryptoMarketAssetSchema })).toBeDefined()
  })
})
