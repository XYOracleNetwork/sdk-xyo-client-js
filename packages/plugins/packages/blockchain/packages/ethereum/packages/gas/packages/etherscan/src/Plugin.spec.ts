import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasPayloadPlugin } from './Plugin'
import { XyoEthereumGasSchema } from './Schema'
import { XyoEthereumGasWitness } from './Witness'

describe('XyoEthereumGasPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasPayloadPlugin(), {
      witness: { config: { apiKey, schema: XyoEthereumGasWitness.configSchema, targetSchema: XyoEthereumGasWitness.targetSchema } },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasSchema)).toBeObject()
  })
})
