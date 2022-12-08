import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CryptoCardsMovePayloadPlugin } from './Plugin'

describe('CryptoCardsMovePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CryptoCardsMovePayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
