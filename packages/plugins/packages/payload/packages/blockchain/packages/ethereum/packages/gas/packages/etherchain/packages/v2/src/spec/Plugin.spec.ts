import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { EthereumGasEtherchainV2PayloadPlugin } from '../Plugin'

describe('EthereumGasEtherchainV2PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = EthereumGasEtherchainV2PayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
