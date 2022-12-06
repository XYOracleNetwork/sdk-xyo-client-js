import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherchainV1Plugin } from './Plugin'
import { XyoEthereumGasEtherchainV1Schema } from './Schema'

describe('XyoEthereumGasEtherchainV1Plugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoEthereumGasEtherchainV1Plugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherchainV1Schema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV1Schema)).toBeObject()
  })
})
