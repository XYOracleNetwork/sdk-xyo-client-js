import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationV2PayloadPlugin } from './Plugin'
import { XyoEthereumGasEthgasstationV2Schema } from './Schema'

describe('XyoEthereumGasEthgasstationV2PayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEthgasstationV2PayloadPlugin())
    expect(resolver.resolve({ schema: XyoEthereumGasEthgasstationV2Schema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthgasstationV2Schema)).toBeObject()
  })
})
