import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCoingeckoCryptoMarketPlugin } from './Plugin'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoCoingeckoCryptoMarketPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
