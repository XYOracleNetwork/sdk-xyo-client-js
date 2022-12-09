import { InfuraProvider } from '@ethersproject/providers'
import { XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthersPlugin } from './Plugin'
import { XyoEthereumGasEthersWitness } from './Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthersPlugin', () => {
  testIf(projectId && projectSecret)('Add to Resolver', () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const plugin = XyoEthereumGasEthersPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin, {
      witness: { config: { schema: XyoEthereumGasEthersWitness.configSchema }, provider },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthersSchema)).toBeObject()
  })
})
