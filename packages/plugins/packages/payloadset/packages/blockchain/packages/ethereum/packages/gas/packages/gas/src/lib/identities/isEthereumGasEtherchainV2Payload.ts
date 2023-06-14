import { EthereumGasEtherchainV2Payload, EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import { Payload } from '@xyo-network/payload-model'

export const isEthereumGasEtherchainV2Payload = (payload?: Payload | null): payload is EthereumGasEtherchainV2Payload => {
  return payload?.schema === EthereumGasEtherchainV2Schema
}
