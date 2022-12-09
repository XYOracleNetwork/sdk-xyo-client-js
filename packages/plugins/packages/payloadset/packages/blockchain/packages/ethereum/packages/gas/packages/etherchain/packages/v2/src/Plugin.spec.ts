import { XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV2Plugin } from './Plugin'

describe('XyoEthereumGasEtherchainV2Plugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV2Plugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV2Schema)).toBeObject()
  })
})
