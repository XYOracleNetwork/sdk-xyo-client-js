import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsGamePlugin } from './Plugin'
import { XyoCryptoCardsGameSchema } from './Schema'

describe('XyoCryptoCardsGamePlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoCryptoCardsGamePlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsGameSchema })).toBeObject()
    expect(resolver.witness(XyoCryptoCardsGameSchema)).toBeObject()
  })
})
