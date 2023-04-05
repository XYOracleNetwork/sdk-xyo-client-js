import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasPayloadPlugin } from './Plugin'

describe('XyoEthereumGasPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
