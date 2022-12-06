import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMovePlugin } from './Plugin'
import { XyoCryptoCardsMoveSchema } from './Schema'

describe('XyoCryptoCardsMovePlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoCryptoCardsMovePlugin())
    expect(resolver.resolve({ schema: XyoCryptoCardsMoveSchema })).toBeObject()
    expect(resolver.witness(XyoCryptoCardsMoveSchema)).toBeObject()
  })
})
