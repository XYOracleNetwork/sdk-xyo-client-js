import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV2Plugin } from './Plugin'
import { XyoEthereumGasEtherchainV2Schema } from './Schema'

describe('XyoEthereumGasEtherchainV2Plugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV2Plugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV2Schema)).toBeObject()
  })
})
