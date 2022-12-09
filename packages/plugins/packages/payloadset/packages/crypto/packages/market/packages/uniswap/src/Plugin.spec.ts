import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoUniswapCryptoMarketPlugin } from './Plugin'

describe('XyoCryptoMarketUniswapPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoUniswapCryptoMarketPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
