import { InfuraProvider } from '@ethersproject/providers'
import { EthereumGasBlocknativeWitness, EthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { EtherchainEthereumGasWitnessV2, EthereumGasEtherchainV2WitnessConfigSchema } from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
import { EthereumGasEthersWitness, EthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { EthereumGasEtherscanWitness, EthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { EthereumGasEthgasstationWitness, EthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-plugin'
import { EthereumGasPayload, EthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

import { EthereumGasDiviner } from '../Diviner'
import { sampleBlocknativeGas, sampleEtherchainGasV2, sampleEtherscanGas, sampleEthersGas, sampleEthgasstationGas } from '../test'

describe('Diviner', () => {
  const cases: [title: string, data: Payload[]][] = [
    ['EthereumGasBlocknativePayload', [sampleBlocknativeGas]],
    ['EthereumGasEtherchainV2Payload', [sampleEtherchainGasV2]],
    ['EthereumGasEtherscanPayload', [sampleEtherscanGas]],
    ['EthereumGasEthersPayload', [sampleEthersGas]],
    ['EthereumGasEthgasstationPayload', [sampleEthgasstationGas]],
    ['no gas payloads', []],
    ['all supported gas payloads', [sampleBlocknativeGas, sampleEtherchainGasV2, sampleEtherscanGas, sampleEthersGas, sampleEthgasstationGas]],
  ]
  test.each(cases)('with %s returns divined gas price', async (_title: string, data: Payload[]) => {
    const diviner = await EthereumGasDiviner.create()
    const payloads = await diviner.divine(data)
    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    const gasPayload = payloads.pop() as EthereumGasPayload
    expect(gasPayload).toBeObject()
    expect(gasPayload.schema).toBe(EthereumGasSchema)
    expect(gasPayload.timestamp).toBeNumber()
    expect(gasPayload.feePerGas).toBeObject()
    expect(gasPayload.priorityFeePerGas).toBeObject()
  })
  test.skip('diviner calibration', async () => {
    // NOTE: This test is for obtaining concurrent witnessed
    // results for diviner weighting/calibration
    const blocknativeGas = (
      await (
        await EthereumGasBlocknativeWitness.create({
          config: {
            schema: EthereumGasBlocknativeWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherchainGasV2 = (
      await (
        await EtherchainEthereumGasWitnessV2.create({
          config: {
            schema: EthereumGasEtherchainV2WitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherscanGas = (
      await (
        await EthereumGasEtherscanWitness.create({
          config: {
            apiKey: process.env.ETHERSCAN_API_KEY || '',
            schema: EthereumGasEtherscanWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const ethersGas = (
      await (
        await EthereumGasEthersWitness.create({
          config: {
            schema: EthereumGasEthersWitnessConfigSchema,
          },
          provider: new InfuraProvider('homestead', {
            projectId: process.env.INFURA_PROJECT_ID,
            projectSecret: process.env.INFURA_PROJECT_SECRET,
          }),
        })
      ).observe()
    )?.[0]
    const ethgasstationGas = (
      await (
        await EthereumGasEthgasstationWitness.create({
          config: {
            schema: EthereumGasEthgasstationWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const observations: Payload[] = [blocknativeGas, etherchainGasV2, etherscanGas, ethersGas, ethgasstationGas]

    const diviner = await EthereumGasDiviner.create()

    const payloads = await diviner.divine(observations)

    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === EthereumGasSchema) {
        const gasPayload = payload as EthereumGasPayload
        expect(gasPayload).toBeObject()
        expect(gasPayload.schema).toBe(EthereumGasSchema)
        expect(gasPayload.timestamp).toBeNumber()
      }
    })
  })
})
