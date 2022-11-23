import { InfuraProvider } from '@ethersproject/providers'
import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayloadPlugin } from './Plugin'
import { XyoEthereumGasEthersSchema } from './Schema'
import { XyoEthereumGasEthersWitness } from './Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthersPayloadPlugin', () => {
  testIf(projectId && projectSecret)('Add to Resolver', () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const resolver = new XyoPayloadPluginResolver().register(XyoEthereumGasEthersPayloadPlugin(), {
      witness: { config: { schema: XyoEthereumGasEthersWitness.configSchema, targetSchema: XyoEthereumGasEthersWitness.targetSchema }, provider },
    })
    expect(resolver.resolve({ schema: XyoEthereumGasEthersSchema })).toBeObject()
    expect(resolver.witness(XyoEthereumGasEthersSchema)).toBeObject()
  })
})
