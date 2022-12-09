import { XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasBlocknativePlugin } from './Plugin'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

describe('XyoEthereumGasBlocknativePlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoEthereumGasBlocknativePlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: {
        config: { schema: XyoEthereumGasBlocknativeWitness.configSchema },
      },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasBlocknativeSchema)).toBeObject()
  })
})
