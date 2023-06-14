import { testIf } from '@xylabs/jest-helpers'
import { EthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { EthereumGasEtherscanPlugin } from '../Plugin'
import { EthereumGasEtherscanWitness } from '../Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

describe('EthereumGasEtherscanPlugin', () => {
  testIf(apiKey)('Add to Resolver', async () => {
    const plugin = EthereumGasEtherscanPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { apiKey, schema: EthereumGasEtherscanWitness.configSchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(EthereumGasEtherscanSchema)).toBeObject()
  })
})
