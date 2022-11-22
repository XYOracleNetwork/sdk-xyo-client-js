import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayloadPlugin } from './Plugin'
import { XyoEthereumGasEthersSchema } from './Schema'
import { XyoEthereumGasEthersWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthersPayloadPlugin', () => {
  testIf(apiKey)('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEthersPayloadPlugin(), {
      witness: { config: { apiKey, schema: XyoEthereumGasEthersWitness.configSchema, targetSchema: XyoEthereumGasEthersWitness.targetSchema } },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasEthersSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthersSchema)).toBeObject()
  })
})
