import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEtherscanSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'
import { XyoEtherscanEthereumGasWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEtherscanEthereumGasWitness', () => {
  testIf(apiKey)('returns observation', async () => {
    const sut = await XyoEtherscanEthereumGasWitness.create({
      config: {
        apiKey,
        schema: XyoEthereumGasEtherscanWitnessConfigSchema,
        targetSchema: XyoEthereumGasEtherscanSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.FastGasPrice).toBeString()
    expect(actual.gasUsedRatio).toBeString()
    expect(actual.LastBlock).toBeString()
    expect(actual.ProposeGasPrice).toBeString()
    expect(actual.SafeGasPrice).toBeString()
    expect(actual.suggestBaseFee).toBeString()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherscanSchema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })

  describe('create', () => {
    it('throws if no params provided', async () => {
      await expect(XyoEtherscanEthereumGasWitness.create()).toReject()
    })
  })
})
