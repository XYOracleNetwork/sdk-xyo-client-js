import { EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { EthereumGasEtherchainV2Plugin } from '../Plugin'

describe('EthereumGasEtherchainV2Plugin', () => {
  test('Add to Resolver', async () => {
    const plugin = EthereumGasEtherchainV2Plugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(EthereumGasEtherchainV2Schema)).toBeObject()
  })
})
