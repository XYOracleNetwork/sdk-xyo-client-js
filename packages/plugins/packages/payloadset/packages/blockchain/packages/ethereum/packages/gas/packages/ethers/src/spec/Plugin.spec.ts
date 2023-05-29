import { InfuraProvider } from '@ethersproject/providers'
import { testIf } from '@xylabs/jest-helpers'
import { XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthersPlugin } from '../Plugin'
import { XyoEthereumGasEthersWitness } from '../Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

describe('XyoEthereumGasEthersPlugin', () => {
  testIf(projectId && projectSecret)('Add to Resolver', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const plugin = XyoEthereumGasEthersPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: XyoEthereumGasEthersWitness.configSchema },
      provider,
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthersSchema)).toBeObject()
  })
})
