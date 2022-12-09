import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayloadPlugin } from './Plugin'

describe('XyoEthereumGasEtherscanPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherscanPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
