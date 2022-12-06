import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasPlugin } from './Plugin'
import { XyoEthereumGasSchema } from './Schema'

describe('XyoCryptoMarketCoinGeckoPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoEthereumGasPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasSchema })).toBeDefined()
  })
})
