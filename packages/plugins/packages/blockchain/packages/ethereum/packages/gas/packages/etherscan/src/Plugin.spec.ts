import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherscanPlugin } from './Plugin'
import { XyoEthereumGasEtherscanSchema } from './Schema'
import { XyoEthereumGasEtherscanWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEtherscanPlugin', () => {
  testIf(apiKey)('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherscanPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: { config: { apiKey, schema: XyoEthereumGasEtherscanWitness.configSchema } },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherscanSchema)).toBeObject()
  })
})
