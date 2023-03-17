import { XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import { Payload } from '@xyo-network/payload-model'

export const isXyoEthereumGasEtherchainV2Payload = (payload?: Payload | null): payload is XyoEthereumGasEtherchainV2Payload => {
  return payload?.schema === XyoEthereumGasEtherchainV2Schema
}
