import { CryptoCardsGameSchema } from '@xyo-network/crypto-cards-game-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoCardsGamePlugin } from '../Plugin'

describe('CryptoCardsGamePlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoCardsGamePlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(CryptoCardsGameSchema)).toBeObject()
  })
})
