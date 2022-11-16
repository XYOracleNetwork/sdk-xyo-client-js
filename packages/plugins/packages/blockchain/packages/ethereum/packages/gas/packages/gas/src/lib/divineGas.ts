import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { isXyoEthereumGasEtherchainV1Payload, isXyoEthereumGasEtherchainV2Payload, isXyoEthereumGasEtherscanPayload } from './identities'
import { transformGasFromEtherscan } from './transforms'

export const divineGas = (payloads: XyoPayloads): XyoPayload => {
  const etherChainV1 = payloads.filter(isXyoEthereumGasEtherchainV1Payload)
  const etherChainV2 = payloads.filter(isXyoEthereumGasEtherchainV2Payload)
  const etherscan = payloads.filter(isXyoEthereumGasEtherscanPayload).map(transformGasFromEtherscan)
  throw new Error('Not Implemented')
}
