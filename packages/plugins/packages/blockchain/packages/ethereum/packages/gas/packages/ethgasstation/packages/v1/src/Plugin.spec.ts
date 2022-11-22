import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationV1PayloadPlugin } from './Plugin'
import { XyoEthereumGasEthgasstationV1Schema } from './Schema'

describe('XyoEthereumGasEthgasstationV1PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEthgasstationV1PayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEthgasstationV1Schema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthgasstationV1Schema)).toBeObject()
  })
})
