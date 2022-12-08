import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsGamePlugin } from './Plugin'
import { XyoCryptoCardsGameSchema } from './Schema'

describe('XyoCryptoCardsGamePlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoCryptoCardsGamePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoCryptoCardsGameSchema)).toBeObject()
  })
})
