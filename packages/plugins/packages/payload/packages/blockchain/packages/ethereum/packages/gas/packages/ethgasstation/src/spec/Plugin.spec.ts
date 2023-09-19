import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { EthereumGasPayloadPlugin } from '../Plugin'

describe('EthereumGasPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = EthereumGasPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
