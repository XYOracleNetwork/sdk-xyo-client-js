import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasPayloadPlugin } from './Plugin'
import { XyoEthereumGasSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasPayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasSchema })).toBeDefined()
  })
})
