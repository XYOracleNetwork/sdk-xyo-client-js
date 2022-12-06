import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthgasstationPlugin } from './Plugin'
import { XyoEthereumGasEthgasstationSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

describe('XyoEthereumGasEthgasstationPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasEthgasstationPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: { schema: XyoEthereumGasEthgasstationWitness.configSchema },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthgasstationSchema)).toBeObject()
  })
})
