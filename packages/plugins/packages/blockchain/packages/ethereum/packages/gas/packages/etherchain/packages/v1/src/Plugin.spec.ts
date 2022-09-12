import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1PayloadPlugin } from './Plugin'
import { XyoEthereumGasEtherchainV1Schema } from './Schema'

describe('XyoEthereumGasEtherchainV1PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEtherchainV1PayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherchainV1Schema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV1Schema)).toBeObject()
  })
})
