import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1PayloadPlugin } from './Plugin'

describe('XyoEthereumGasEtherchainV1PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV1PayloadPlugin()
    const resolver = new XyoPayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
