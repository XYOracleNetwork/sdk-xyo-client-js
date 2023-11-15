import { testIf } from '@xylabs/jest-helpers'
import { EthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { EthereumGasEthersPlugin } from '../Plugin'
import { EthereumGasEthersWitness } from '../Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

describe('EthereumGasEthersPlugin', () => {
  testIf(projectId && projectSecret)('Add to Resolver', async () => {
    const provider = getProviderFromEnv()
    const plugin = EthereumGasEthersPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: EthereumGasEthersWitness.configSchema },
      provider,
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(EthereumGasEthersSchema)).toBeObject()
  })
})
