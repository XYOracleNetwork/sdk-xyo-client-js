import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import Plugin from './index'

describe('XyoCryptoMarketUniswapPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(Plugin())
    expect(resolver.resolve({ schema: 'network.xyo.crypto.market.uniswap' })).toBeDefined()
  })
})
