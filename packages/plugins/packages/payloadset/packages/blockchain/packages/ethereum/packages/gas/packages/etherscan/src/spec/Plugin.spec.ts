import { testIf } from '@xylabs/jest-helpers'
import { XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEtherscanPlugin } from '../Plugin'
import { XyoEthereumGasEtherscanWitness } from '../Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

describe('XyoEthereumGasEtherscanPlugin', () => {
  testIf(apiKey)('Add to Resolver', () => {
    const plugin = XyoEthereumGasEtherscanPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      config: { apiKey, schema: XyoEthereumGasEtherscanWitness.configSchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEtherscanSchema)).toBeObject()
  })
})
