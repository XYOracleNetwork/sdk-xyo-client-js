import { XyoAccount } from '@xyo-network/account'

import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoEtherchainEthereumGasWitnessV1({
      account: new XyoAccount(),
      schema: XyoEthereumGasEtherchainV1WitnessConfigSchema,
      targetSchema: XyoEthereumGasEtherchainV1Schema,
    })
    const actual = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.currentBaseFee).toBeNumber()
    expect(actual.fast).toBeNumber()
    expect(actual.fastest).toBeNumber()
    expect(actual.recommendedBaseFee).toBeNumber()
    expect(actual.safeLow).toBeNumber()
    expect(actual.standard).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV1Schema)
  })
})
