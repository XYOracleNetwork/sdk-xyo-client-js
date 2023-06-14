import { testIf } from '@xylabs/jest-helpers'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoEthereumGasEtherscanWitnessConfigSchema } from '../Schema'
import { XyoEthereumGasEtherscanWitness } from '../Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

describe('XyoEthereumGasEtherscanWitness', () => {
  testIf(apiKey)('returns observation', async () => {
    const sut = await XyoEthereumGasEtherscanWitness.create({
      config: {
        apiKey,
        schema: XyoEthereumGasEtherscanWitnessConfigSchema,
      },
    })
    const [actual] = (await sut.observe()) as XyoEthereumGasEtherscanPayload[]
    expect(actual.result).toBeObject()
    expect(actual.result.FastGasPrice).toBeString()
    expect(actual.result.gasUsedRatio).toBeString()
    expect(actual.result.LastBlock).toBeString()
    expect(actual.result.ProposeGasPrice).toBeString()
    expect(actual.result.SafeGasPrice).toBeString()
    expect(actual.result.suggestBaseFee).toBeString()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherscanSchema)

    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })

  /*describe('create', () => {
    it('throws if no params provided', async () => {
      await expect(XyoEthereumGasEtherscanWitness.create()).toReject()
    })
  })*/
})
