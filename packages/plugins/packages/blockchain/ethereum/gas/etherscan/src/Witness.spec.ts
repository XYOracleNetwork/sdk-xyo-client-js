import { XyoAccount } from '@xyo-network/account'

import { XyoEthereumGasEtherscanPayloadSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'
import { XyoEtherscanEthereumGasWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoEtherscanEthereumGasWitness({
      account: new XyoAccount(),
      apiKey: '',
      schema: XyoEthereumGasEtherscanWitnessConfigSchema,
      targetSchema: XyoEthereumGasEtherscanPayloadSchema,
    })
    const actual = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.lastBlock).toBeNumber()
    expect(actual.safeGasPrice).toBeNumber()
    expect(actual.proposeGasPrice).toBeNumber()
    expect(actual.fastGasPrice).toBeNumber()
    expect(actual.suggestBaseFee).toBeNumber()
    expect(actual.gasUsedRatio).toBeArray()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherscanPayloadSchema)
  })
})
