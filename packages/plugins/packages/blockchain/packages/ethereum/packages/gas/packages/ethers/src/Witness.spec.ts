import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthersSchema, XyoEthereumGasEthersWitnessConfigSchema } from './Schema'
import { XyoEthereumGasEthersWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthersWitness', () => {
  testIf(apiKey)('returns observation', async () => {
    const sut = await XyoEthereumGasEthersWitness.create({
      config: {
        apiKey,
        schema: XyoEthereumGasEthersWitnessConfigSchema,
        targetSchema: XyoEthereumGasEthersSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.result).toBeObject()
    expect(actual.result.FastGasPrice).toBeString()
    expect(actual.result.gasUsedRatio).toBeString()
    expect(actual.result.LastBlock).toBeString()
    expect(actual.result.ProposeGasPrice).toBeString()
    expect(actual.result.SafeGasPrice).toBeString()
    expect(actual.result.suggestBaseFee).toBeString()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthersSchema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })

  describe('create', () => {
    it('throws if no params provided', async () => {
      await expect(XyoEthereumGasEthersWitness.create()).toReject()
    })
  })
})
