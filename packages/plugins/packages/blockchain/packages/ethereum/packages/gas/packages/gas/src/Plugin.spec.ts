import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetPayloadPlugin } from './Plugin'
import { XyoCryptoMarketAssetSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoMarketAssetPayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoMarketAssetSchema })).toBeDefined()
  })
})
