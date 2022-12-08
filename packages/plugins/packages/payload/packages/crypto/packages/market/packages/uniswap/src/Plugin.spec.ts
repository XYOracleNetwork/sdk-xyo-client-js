import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { UniswapCryptoMarketPayloadPlugin } from './Plugin'

describe('UniswapCryptoMarketPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = UniswapCryptoMarketPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
