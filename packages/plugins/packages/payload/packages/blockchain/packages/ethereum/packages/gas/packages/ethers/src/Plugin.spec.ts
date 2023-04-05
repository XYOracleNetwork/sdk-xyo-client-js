import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayloadPlugin } from './Plugin'

describe('XyoEthereumGasEthersPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEthersPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
