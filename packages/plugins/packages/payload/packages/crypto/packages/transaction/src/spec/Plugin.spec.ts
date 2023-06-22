import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { CryptoWalletNftPayloadPlugin } from '../Plugin'

describe('CryptoWalletNftPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = CryptoWalletNftPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
