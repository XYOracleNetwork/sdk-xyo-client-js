import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoMarketAssetPlugin } from '../Plugin'

describe('CryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoMarketAssetPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
