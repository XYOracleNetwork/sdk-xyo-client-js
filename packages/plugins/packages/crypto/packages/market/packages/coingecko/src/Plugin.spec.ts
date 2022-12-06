import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCoingeckoCryptoMarketPlugin } from './Plugin'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoCoingeckoCryptoMarketPlugin())
    expect(resolver.resolve({ schema: XyoCoingeckoCryptoMarketSchema })).toBeDefined()
  })
})
