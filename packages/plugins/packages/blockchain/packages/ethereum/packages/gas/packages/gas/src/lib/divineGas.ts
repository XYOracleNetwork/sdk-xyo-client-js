import { XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'

import { FeeData } from '../Model'
import { XyoEthereumGasPayload } from '../Payload'
import { XyoEthereumGasSchema } from '../Schema'
import { average } from './average'
import { isXyoEthereumGasEtherchainV1Payload, isXyoEthereumGasEtherchainV2Payload, isXyoEthereumGasEtherscanPayload } from './identities'
import { transformGasFromEtherchainV1, transformGasFromEtherchainV2, transformGasFromEtherscan } from './transforms'

export const divineGas = (payloads: XyoPayloads): XyoEthereumGasPayload => {
  const etherChainV1 = payloads.filter(isXyoEthereumGasEtherchainV1Payload).map(transformGasFromEtherchainV1)
  const etherChainV2 = payloads.filter(isXyoEthereumGasEtherchainV2Payload).map(transformGasFromEtherchainV2)
  const etherscan = payloads.filter(isXyoEthereumGasEtherscanPayload).map(transformGasFromEtherscan)
  const transactionCosts: FeeData[] = [...etherChainV1, ...etherChainV2, ...etherscan]
  const avg = average(transactionCosts)
  const timestamp = Date.now()
  const payload = new XyoPayloadBuilder<XyoEthereumGasPayload>({ schema: XyoEthereumGasSchema }).fields({ ...avg, timestamp }).build()
  return payload
}
