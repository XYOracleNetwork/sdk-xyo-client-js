import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoWalletNftWitnessPlugin } from '../Plugin'

describe('CryptoWalletNftWitnessPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoWalletNftWitnessPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
