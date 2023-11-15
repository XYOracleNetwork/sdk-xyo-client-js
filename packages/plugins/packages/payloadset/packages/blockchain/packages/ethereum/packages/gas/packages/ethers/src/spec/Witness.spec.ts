import { Account } from '@xyo-network/account'
import { EthereumGasEthersPayload, EthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { EthereumGasEthersWitnessConfigSchema } from '../Schema'
import { EthereumGasEthersWitness } from '../Witness'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

import { testIf } from '@xylabs/jest-helpers'

/**
 * @group crypto
 * @group slow
 */

describe('EthereumGasEthersWitness', () => {
  testIf(projectId && projectSecret)('returns observation', async () => {
    const provider = getProviderFromEnv()
    const sut = await EthereumGasEthersWitness.create({
      account: Account.randomSync(),
      config: {
        schema: EthereumGasEthersWitnessConfigSchema,
      },
      provider,
    })
    const [actual] = await sut.observe()
    expect((actual as EthereumGasEthersPayload).timestamp).toBeNumber()
    expect(actual.schema).toBe(EthereumGasEthersSchema)
    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
