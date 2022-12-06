import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV2Plugin } from './Plugin'
import { XyoEthereumGasEtherchainV2Schema } from './Schema'

describe('XyoEthereumGasEtherchainV2Plugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoEthereumGasEtherchainV2Plugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherchainV2Schema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV2Schema)).toBeObject()
  })
})
