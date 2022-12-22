import { InfuraProvider } from '@ethersproject/providers'
import { XyoEthereumGasBlocknativeWitness, XyoEthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { DivinerWrapper } from '@xyo-network/diviner'
import {
  XyoEtherchainEthereumGasWitnessV1,
  XyoEtherchainEthereumGasWitnessV2,
  XyoEthereumGasEtherchainV1WitnessConfigSchema,
  XyoEthereumGasEtherchainV2WitnessConfigSchema,
} from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
import { XyoEthereumGasEthersWitness, XyoEthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { XyoEthereumGasEtherscanWitness, XyoEthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { XyoEthereumGasEthgasstationWitness, XyoEthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-plugin'
import { XyoEthereumGasPayload, XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoEthereumGasDiviner } from './Diviner'
import {
  sampleBlocknativeGas,
  sampleEtherchainGasV1,
  sampleEtherchainGasV2,
  sampleEtherscanGas,
  sampleEthersGas,
  sampleEthgasstationGas,
} from './test'

describe('Diviner', () => {
  test('returns divined gas price', async () => {
    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new DivinerWrapper(module)

    const payloads = await wrapper.divine([
      sampleBlocknativeGas,
      sampleEtherchainGasV1,
      sampleEtherchainGasV2,
      sampleEtherscanGas,
      sampleEthersGas,
      sampleEthgasstationGas,
    ])

    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === XyoEthereumGasSchema) {
        const gasPayload = payload as XyoEthereumGasPayload
        expect(gasPayload).toBeObject()
        expect(gasPayload.schema).toBe(XyoEthereumGasSchema)
        expect(gasPayload.timestamp).toBeNumber()
      }
    })
  })
  test.skip('diviner calibration', async () => {
    // NOTE: This test is for obtaining concurrent witnessed
    // results for diviner weighting/calibration
    const blocknativeGas = (
      await (
        await XyoEthereumGasBlocknativeWitness.create({
          config: {
            schema: XyoEthereumGasBlocknativeWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherchainGasV1 = (
      await (
        await XyoEtherchainEthereumGasWitnessV1.create({
          config: {
            schema: XyoEthereumGasEtherchainV1WitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherchainGasV2 = (
      await (
        await XyoEtherchainEthereumGasWitnessV2.create({
          config: {
            schema: XyoEthereumGasEtherchainV2WitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherscanGas = (
      await (
        await XyoEthereumGasEtherscanWitness.create({
          config: {
            apiKey: process.env.ETHERSCAN_API_KEY || '',
            schema: XyoEthereumGasEtherscanWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const ethersGas = (
      await (
        await XyoEthereumGasEthersWitness.create({
          config: {
            schema: XyoEthereumGasEthersWitnessConfigSchema,
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
        await XyoEthereumGasEthgasstationWitness.create({
          config: {
            schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
          },
        })
      ).observe()
    )?.[0]
    const observations: XyoPayload[] = [blocknativeGas, etherchainGasV1, etherchainGasV2, etherscanGas, ethersGas, ethgasstationGas]

    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new DivinerWrapper(module)

    const payloads = await wrapper.divine(observations)

    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === XyoEthereumGasSchema) {
        const gasPayload = payload as XyoEthereumGasPayload
        expect(gasPayload).toBeObject()
        expect(gasPayload.schema).toBe(XyoEthereumGasSchema)
        expect(gasPayload.timestamp).toBeNumber()
      }
    })
  })
})
