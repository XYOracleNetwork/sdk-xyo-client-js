import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayloadPlugin } from './Plugin'
import { XyoCryptoCardsGameSchema } from './Schema'

describe('XyoCryptoCardsGamePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoCardsGamePayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsGameSchema })).toBeObject()
    expect(resolver.witness(XyoCryptoCardsGameSchema)).toBeObject()
  })
})
