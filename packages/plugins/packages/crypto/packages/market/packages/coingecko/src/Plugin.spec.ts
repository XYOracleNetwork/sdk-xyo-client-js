import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCoingeckoCryptoMarketPayloadPlugin } from './Plugin'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCoingeckoCryptoMarketPayloadPlugin())
    expect(resolver.resolve({ schema: XyoCoingeckoCryptoMarketSchema })).toBeDefined()
  })
})
