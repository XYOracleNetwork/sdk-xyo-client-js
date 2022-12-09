import { XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-ethereum-gas-v1-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV1Plugin } from './Plugin'

describe('XyoEthereumGasEtherchainV1Plugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherchainV1Plugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV1Schema)).toBeObject()
  })
})
