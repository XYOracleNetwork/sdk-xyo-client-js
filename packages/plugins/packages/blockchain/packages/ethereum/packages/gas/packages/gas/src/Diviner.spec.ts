import { InfuraProvider } from '@ethersproject/providers'
import {
  XyoEthereumGasBlocknativeSchema,
  XyoEthereumGasBlocknativeWitness,
  XyoEthereumGasBlocknativeWitnessConfigSchema,
} from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import {
  XyoEtherchainEthereumGasWitnessV1,
  XyoEtherchainEthereumGasWitnessV2,
  XyoEthereumGasEtherchainV1Schema,
  XyoEthereumGasEtherchainV1WitnessConfigSchema,
  XyoEthereumGasEtherchainV2Schema,
  XyoEthereumGasEtherchainV2WitnessConfigSchema,
} from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import {
  XyoEthereumGasEthersSchema,
  XyoEthereumGasEthersWitness,
  XyoEthereumGasEthersWitnessConfigSchema,
} from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import {
  XyoEthereumGasEtherscanSchema,
  XyoEthereumGasEtherscanWitness,
  XyoEthereumGasEtherscanWitnessConfigSchema,
} from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import {
  XyoEthereumGasEthgasstationSchema,
  XyoEthereumGasEthgasstationWitness,
  XyoEthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasDiviner } from './Diviner'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
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
    const wrapper = new XyoDivinerWrapper(module)

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
            targetSchema: XyoEthereumGasBlocknativeSchema,
          },
        })
      ).observe()
    )?.[0]
    const etherchainGasV1 = (
      await (
        await XyoEtherchainEthereumGasWitnessV1.create({
          config: {
            schema: XyoEthereumGasEtherchainV1WitnessConfigSchema,
            targetSchema: XyoEthereumGasEtherchainV1Schema,
          },
        })
      ).observe()
    )?.[0]
    const etherchainGasV2 = (
      await (
        await XyoEtherchainEthereumGasWitnessV2.create({
          config: {
            schema: XyoEthereumGasEtherchainV2WitnessConfigSchema,
            targetSchema: XyoEthereumGasEtherchainV2Schema,
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
            targetSchema: XyoEthereumGasEtherscanSchema,
          },
        })
      ).observe()
    )?.[0]
    const ethersGas = (
      await (
        await XyoEthereumGasEthersWitness.create({
          config: {
            schema: XyoEthereumGasEthersWitnessConfigSchema,
            targetSchema: XyoEthereumGasEthersSchema,
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
            targetSchema: XyoEthereumGasEthgasstationSchema,
          },
        })
      ).observe()
    )?.[0]
    const observations: XyoPayload[] = [blocknativeGas, etherchainGasV1, etherchainGasV2, etherscanGas, ethersGas, ethgasstationGas]

    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new XyoDivinerWrapper(module)

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
