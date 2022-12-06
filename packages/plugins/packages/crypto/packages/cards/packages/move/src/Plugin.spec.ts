import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMovePlugin } from './Plugin'
import { XyoCryptoCardsMoveSchema } from './Schema'

describe('XyoCryptoCardsMovePlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoCryptoCardsMovePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoCryptoCardsMoveSchema)).toBeObject()
  })
})
