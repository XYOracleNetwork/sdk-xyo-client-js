import { EthereumGasEthgasstationSchema, EthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { EthereumGasEthgasstationWitness } from '../Witness'

describe('EthereumGasEthgasstationWitness', () => {
  test('returns observation', async () => {
    const sut = await EthereumGasEthgasstationWitness.create({
      config: {
        schema: EthereumGasEthgasstationWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(EthereumGasEthgasstationSchema)

    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
