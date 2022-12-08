import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoMarketAssetPlugin } from './Plugin'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoCryptoMarketAssetPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
