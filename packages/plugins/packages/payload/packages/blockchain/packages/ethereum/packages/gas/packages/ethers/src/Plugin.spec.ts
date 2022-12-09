import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayloadPlugin } from './Plugin'

describe('XyoEthereumGasEthersPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEthersPayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
