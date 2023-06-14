import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { EthereumGasEtherscanPayloadPlugin } from '../Plugin'

describe('EthereumGasEtherscanPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = EthereumGasEtherscanPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
