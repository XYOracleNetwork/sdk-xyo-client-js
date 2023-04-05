import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CoingeckoCryptoMarketPayloadPlugin } from '../Plugin'

describe('CoingeckoCryptoMarketPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CoingeckoCryptoMarketPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
