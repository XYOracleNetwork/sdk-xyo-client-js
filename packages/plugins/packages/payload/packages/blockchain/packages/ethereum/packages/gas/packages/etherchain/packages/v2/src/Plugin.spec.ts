import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2PayloadPlugin } from './Plugin'

describe('XyoEthereumGasEtherchainV2PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV2PayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
