import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CryptoMarketAssetPayloadPlugin } from '../Plugin'

describe('CryptoMarketAssetPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CryptoMarketAssetPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
