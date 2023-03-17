import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayloadPlugin } from '../Plugin'

describe('XyoEthereumGasEtherscanPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherscanPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
