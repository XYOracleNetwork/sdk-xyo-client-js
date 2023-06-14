import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { EthereumGasEthersPayloadPlugin } from './Plugin'

describe('EthereumGasEthersPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = EthereumGasEthersPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
