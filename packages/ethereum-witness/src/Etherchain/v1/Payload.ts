import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherchainQueryPayloadV1 = XyoQueryPayload

export interface XyoEthereumGasEtherchainPayloadV1 extends XyoPayload {
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1'
  timestamp: number
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}
