import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasPlugin } from './Plugin'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
