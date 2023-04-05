import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CryptoCardsGamePayloadPlugin } from './Plugin'

describe('CryptoCardsGamePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CryptoCardsGamePayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
