import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationPayloadPlugin } from './Plugin'
import { XyoEthereumGasEthgasstationSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

describe('XyoEthereumGasEthgasstationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEthgasstationPayloadPlugin(), {
      witness: {
        config: { schema: XyoEthereumGasEthgasstationWitness.configSchema, targetSchema: XyoEthereumGasEthgasstationWitness.targetSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasEthgasstationSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthgasstationSchema)).toBeObject()
  })
})
