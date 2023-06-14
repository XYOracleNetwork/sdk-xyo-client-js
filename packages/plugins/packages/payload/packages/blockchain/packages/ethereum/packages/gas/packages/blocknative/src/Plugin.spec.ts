import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { EthereumGasBlocknativePayloadPlugin } from './Plugin'

describe('EthereumGasBlocknativePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = EthereumGasBlocknativePayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
