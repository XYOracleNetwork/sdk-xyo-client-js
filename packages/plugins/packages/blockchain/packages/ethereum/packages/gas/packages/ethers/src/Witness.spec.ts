import { InfuraProvider } from '@ethersproject/providers'
import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthersSchema, XyoEthereumGasEthersWitnessConfigSchema } from './Schema'
import { XyoEthereumGasEthersWitness } from './Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthersWitness', () => {
  testIf(projectId && projectSecret)('returns observation', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const sut = await XyoEthereumGasEthersWitness.create({
      config: {
        schema: XyoEthereumGasEthersWitnessConfigSchema,
      },
      provider,
    })
    const [actual] = await sut.observe()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthersSchema)
    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
