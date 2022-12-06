import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV1Plugin } from './Plugin'
import { XyoEthereumGasEtherchainV1Schema } from './Schema'

describe('XyoEthereumGasEtherchainV1Plugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV1Plugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV1Schema)).toBeObject()
  })
})
