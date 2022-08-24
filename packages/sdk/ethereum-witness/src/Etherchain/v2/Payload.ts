import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEtherchainV2ConfigSchema = 'network.xyo.blockchain.ethereum.gas.etherchain.v2.config'
export const XyoEthereumGasEtherchainV2ConfigSchema: XyoEthereumGasEtherchainV2ConfigSchema =
  'network.xyo.blockchain.ethereum.gas.etherchain.v2.config'

export type XyoEthereumGasEtherchainV2Config = XyoWitnessConfig<
  XyoEthereumGasEtherchainV2Payload,
  {
    schema: XyoEthereumGasEtherchainV2ConfigSchema
  }
>

export type XyoEthereumGasEtherchainV2Schema = 'network.xyo.blockchain.ethereum.gas.etherchain.v2'
export const XyoEthereumGasEtherchainV2Schema: XyoEthereumGasEtherchainV2Schema = 'network.xyo.blockchain.ethereum.gas.etherchain.v2'

export type XyoEthereumGasEtherchainV2Payload = XyoPayload<{
  schema: XyoEthereumGasEtherchainV2Schema
  code: number
  data: {
    fast: number
    priceUSD: number
    rapid: number
    slow: number
    standard: number
    timestamp: number
  }
}>
