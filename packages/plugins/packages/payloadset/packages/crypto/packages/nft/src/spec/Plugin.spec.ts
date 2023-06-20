import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { UniswapCryptoMarketPlugin } from '../Plugin'

describe('CryptoMarketUniswapPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = UniswapCryptoMarketPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
