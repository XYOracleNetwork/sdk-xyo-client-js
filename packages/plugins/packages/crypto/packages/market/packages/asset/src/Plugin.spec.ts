import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetPayloadPlugin } from './Plugin'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoMarketAssetPayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoMarketAssetPayloadSchema })).toBeDefined()
  })
})
