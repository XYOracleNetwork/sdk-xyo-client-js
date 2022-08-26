import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayloadPlugin } from './Plugin'
import { XyoCryptoCardsGamePayloadSchema } from './Schema'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoCardsGamePayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsGamePayloadSchema })).toBeObject()
    expect(resolver.witness(XyoCryptoCardsGamePayloadSchema)).toBeObject()
  })
})
