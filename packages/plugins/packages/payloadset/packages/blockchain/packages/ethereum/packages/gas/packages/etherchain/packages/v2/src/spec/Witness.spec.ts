import { HDWallet } from '@xyo-network/account'
import { EthereumGasEtherchainV2Payload, EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { EthereumGasEtherchainV2WitnessConfigSchema } from '../Schema'
import { EtherchainEthereumGasWitnessV2 } from '../Witness'

describe('EtherchainEthereumGasWitnessV2', () => {
  test('returns observation', async () => {
    const sut = await EtherchainEthereumGasWitnessV2.create({
      account: await HDWallet.random(),
      config: { schema: EthereumGasEtherchainV2WitnessConfigSchema },
    })
    const [actual] = (await sut.observe()) as EthereumGasEtherchainV2Payload[]
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(EthereumGasEtherchainV2Schema)

    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })
  test('returns observation [no config]', async () => {
    const sut = await EtherchainEthereumGasWitnessV2.create({ account: await HDWallet.random() })
    const [actual] = (await sut.observe()) as EthereumGasEtherchainV2Payload[]
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(EthereumGasEtherchainV2Schema)

    const answerWrapper = PayloadWrapper.wrap(actual)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
