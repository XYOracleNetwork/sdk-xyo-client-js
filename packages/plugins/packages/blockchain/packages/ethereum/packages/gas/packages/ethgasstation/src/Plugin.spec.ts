import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthgasstationPlugin } from './Plugin'
import { XyoEthereumGasEthgasstationSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

describe('XyoEthereumGasEthgasstationPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoEthereumGasEthgasstationPlugin(), {
      witness: {
        config: { schema: XyoEthereumGasEthgasstationWitness.configSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasEthgasstationSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthgasstationSchema)).toBeObject()
  })
})
