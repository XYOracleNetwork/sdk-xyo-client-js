import { XyoCryptoCardsMoveSchema } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMovePlugin } from './Plugin'

describe('XyoCryptoCardsMovePlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoCryptoCardsMovePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoCryptoCardsMoveSchema)).toBeObject()
  })
})
