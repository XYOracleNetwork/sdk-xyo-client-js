import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCoingeckoCryptoMarketPayloadPlugin } from './Plugin'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCoingeckoCryptoMarketPayloadPlugin())
    expect(resolver.resolve({ schema: XyoCoingeckoCryptoMarketPayloadSchema })).toBeDefined()
  })
})
