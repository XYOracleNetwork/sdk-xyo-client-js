import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasBlocknativePayloadPlugin } from './Plugin'
import { XyoEthereumGasBlocknativeSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

describe('XyoEthereumGasBlocknativePayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasBlocknativePayloadPlugin(), {
      witness: {
        config: { schema: XyoEthereumGasBlocknativeWitness.configSchema },
      },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasBlocknativeSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasBlocknativeSchema)).toBeObject()
  })
})
