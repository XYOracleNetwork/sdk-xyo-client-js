import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoNftCollectionWitnessPlugin } from '../Plugin'

describe('CryptoNftCollectionWitnessPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoNftCollectionWitnessPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
