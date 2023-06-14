import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CoingeckoCryptoMarketPlugin } from '../Plugin'

describe('CryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CoingeckoCryptoMarketPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
