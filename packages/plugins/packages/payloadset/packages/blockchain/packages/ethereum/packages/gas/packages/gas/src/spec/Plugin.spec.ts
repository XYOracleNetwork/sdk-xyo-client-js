import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { EthereumGasPlugin } from '../Plugin'

describe('CryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = EthereumGasPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
