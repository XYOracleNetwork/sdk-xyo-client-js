import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoUniswapCryptoMarketPayloadPlugin } from './Plugin'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'

describe('XyoCryptoMarketUniswapPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoUniswapCryptoMarketPayloadPlugin())
    expect(resolver.resolve({ schema: XyoUniswapCryptoMarketPayloadSchema })).toBeDefined()
  })
})
