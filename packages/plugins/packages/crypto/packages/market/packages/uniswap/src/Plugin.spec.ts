import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoUniswapCryptoMarketPlugin } from './Plugin'
import { XyoUniswapCryptoMarketSchema } from './Schema'

describe('XyoCryptoMarketUniswapPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoUniswapCryptoMarketPlugin())
    expect(resolver.resolve({ schema: XyoUniswapCryptoMarketSchema })).toBeDefined()
  })
})
