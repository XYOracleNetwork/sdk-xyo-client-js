import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayloadPlugin } from './Plugin'
import { XyoCryptoCardsMovePayloadSchema } from './Schema'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoCardsMovePayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsMovePayloadSchema })).toBeDefined()
  })
})
