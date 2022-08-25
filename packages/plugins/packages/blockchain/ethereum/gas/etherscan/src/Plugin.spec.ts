import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayloadPlugin } from './Plugin'
import { XyoEthereumGasEtherscanPayloadSchema } from './Schema'

describe('XyoEthereumGasEtherscanPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEtherscanPayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEtherscanPayloadSchema })).toBeDefined()
  })
})
