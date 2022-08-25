import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2PayloadPlugin } from './Plugin'
import { XyoEthereumGasEtherchainV2PayloadSchema } from './Schema'

describe('XyoEthereumGasEtherchainV2PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEtherchainV2PayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherchainV2PayloadSchema })).toBeDefined()
  })
})
