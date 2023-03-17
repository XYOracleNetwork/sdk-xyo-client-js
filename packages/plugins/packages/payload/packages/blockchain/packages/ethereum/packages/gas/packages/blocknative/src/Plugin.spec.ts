import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasBlocknativePayloadPlugin } from './Plugin'

describe('XyoEthereumGasBlocknativePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasBlocknativePayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
