import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { CryptoWalletNftPlugin } from '../Plugin'

describe('CryptoWalletNftPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = CryptoWalletNftPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeDefined()
  })
})
