import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayloadPlugin } from './Plugin'
import { XyoCryptoCardsMoveSchema } from './Schema'

describe('XyoCryptoCardsMovePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoCryptoCardsMovePayloadPlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsMoveSchema })).toBeObject()
    expect(resolver.witness(XyoCryptoCardsMoveSchema)).toBeObject()
  })
})
