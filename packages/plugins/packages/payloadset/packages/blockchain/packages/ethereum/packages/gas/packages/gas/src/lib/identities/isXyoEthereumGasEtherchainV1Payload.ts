import { XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import { XyoPayload } from '@xyo-network/payload-model'

export const isXyoEthereumGasEtherchainV1Payload = (payload?: XyoPayload | null): payload is XyoEthereumGasEtherchainV1Payload => {
  return payload?.schema === XyoEthereumGasEtherchainV1Schema
}
