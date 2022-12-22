import { XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

describe('XyoEtherchainEthereumGasWitnessV2', () => {
  test('returns observation', async () => {
    const sut = await XyoEtherchainEthereumGasWitnessV2.create({
      config: { schema: XyoEthereumGasEtherchainV2WitnessConfigSchema },
    })
    const [actual] = (await sut.observe()) as XyoEthereumGasEtherchainV2Payload[]
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV2Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
  test('returns observation [no config]', async () => {
    const sut = await XyoEtherchainEthereumGasWitnessV2.create()
    const [actual] = (await sut.observe()) as XyoEthereumGasEtherchainV2Payload[]
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV2Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
