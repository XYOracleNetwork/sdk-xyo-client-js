import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEtherchainV1ConfigSchema = 'network.xyo.blockchain.ethereum.gas.etherchain.v1.config'
export const XyoEthereumGasEtherchainV1ConfigSchema: XyoEthereumGasEtherchainV1ConfigSchema =
  'network.xyo.blockchain.ethereum.gas.etherchain.v1.config'

export type XyoEthereumGasEtherchainV1Config = XyoWitnessConfig<
  XyoEthereumGasEtherchainV1Schema,
  {
    schema: XyoEthereumGasEtherchainV1ConfigSchema
  }
>

export type XyoEthereumGasEtherchainV1Schema = 'network.xyo.blockchain.ethereum.gas.etherchain.v1'
export const XyoEthereumGasEtherchainV1Schema: XyoEthereumGasEtherchainV1Schema = 'network.xyo.blockchain.ethereum.gas.etherchain.v1'

export type XyoEthereumGasEtherchainV1Payload = XyoPayload<{
  schema: XyoEthereumGasEtherchainV1Schema
  timestamp: number
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}>
