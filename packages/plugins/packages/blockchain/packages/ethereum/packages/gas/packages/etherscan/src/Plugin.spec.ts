import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayloadPlugin } from './Plugin'
import { XyoEthereumGasEtherscanSchema } from './Schema'
import { XyoEthereumGasEtherscanWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEtherscanPayloadPlugin', () => {
  testIf(apiKey)('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEtherscanPayloadPlugin(), {
      witness: { config: { apiKey, schema: XyoEthereumGasEtherscanWitness.configSchema, targetSchema: XyoEthereumGasEtherscanWitness.targetSchema } },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasEtherscanSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherscanSchema)).toBeObject()
  })
})
