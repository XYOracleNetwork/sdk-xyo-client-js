import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoUniswapCryptoMarketPlugin } from '../Plugin'

describe('XyoCryptoMarketUniswapPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = XyoUniswapCryptoMarketPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
