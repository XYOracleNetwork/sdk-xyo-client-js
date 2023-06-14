import {
  XyoEthereumGasEthgasstationSchema,
  XyoEthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoEthereumGasEthgasstationWitness } from '../Witness'

describe('XyoEthereumGasEthgasstationWitness', () => {
  test('returns observation', async () => {
    const sut = await XyoEthereumGasEthgasstationWitness.create({
      config: {
        schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationSchema)

    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
