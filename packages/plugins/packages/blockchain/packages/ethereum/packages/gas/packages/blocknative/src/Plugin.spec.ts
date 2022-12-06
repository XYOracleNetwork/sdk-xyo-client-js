import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasBlocknativePlugin } from './Plugin'
import { XyoEthereumGasBlocknativeSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

describe('XyoEthereumGasBlocknativePlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new PayloadSetPluginResolver().register(XyoEthereumGasBlocknativePlugin(), {
      witness: {
        config: { schema: XyoEthereumGasBlocknativeWitness.configSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasBlocknativeSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasBlocknativeSchema)).toBeObject()
  })
})
