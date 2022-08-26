import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1PayloadPlugin } from './Plugin'
import { XyoEthereumGasEtherchainV1PayloadSchema } from './Schema'

describe('XyoEthereumGasEtherchainV1PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEtherchainV1PayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherchainV1PayloadSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherchainV1PayloadSchema)).toBeObject()
  })
})
