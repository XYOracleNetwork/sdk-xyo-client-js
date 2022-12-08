import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CoingeckoCryptoMarketPayloadPlugin } from './Plugin'

describe('CoingeckoCryptoMarketPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CoingeckoCryptoMarketPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
