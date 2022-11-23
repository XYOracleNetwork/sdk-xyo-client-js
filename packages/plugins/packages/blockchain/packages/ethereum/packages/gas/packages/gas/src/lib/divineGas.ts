import { XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'

import { FeeData } from '../Model'
import { XyoEthereumGasPayload } from '../Payload'
import { XyoEthereumGasSchema } from '../Schema'
import { average } from './average'
import {
  isXyoEthereumGasBlocknativePayload,
  isXyoEthereumGasEtherchainV1Payload,
  isXyoEthereumGasEtherchainV2Payload,
  isXyoEthereumGasEtherscanPayload,
  isXyoEthereumGasEthersPayload,
  isXyoEthereumGasEthgasstationPayload,
} from './identities'
import {
  transformGasFromBlocknative,
  transformGasFromEtherchainV1,
  transformGasFromEtherchainV2,
  transformGasFromEthers,
  transformGasFromEtherscan,
  transformGasFromEthgasstation,
} from './transforms'

export const divineGas = (payloads: XyoPayloads): XyoEthereumGasPayload => {
  const blocknative = payloads.filter(isXyoEthereumGasBlocknativePayload).map(transformGasFromBlocknative)
  const etherchainV1 = payloads.filter(isXyoEthereumGasEtherchainV1Payload).map(transformGasFromEtherchainV1)
  const etherchainV2 = payloads.filter(isXyoEthereumGasEtherchainV2Payload).map(transformGasFromEtherchainV2)
  const ethers = payloads.filter(isXyoEthereumGasEthersPayload).map(transformGasFromEthers)
  const etherscan = payloads.filter(isXyoEthereumGasEtherscanPayload).map(transformGasFromEtherscan)
  const ethgasstation = payloads.filter(isXyoEthereumGasEthgasstationPayload).map(transformGasFromEthgasstation)
  const transactionCosts: FeeData[] = [...blocknative, ...etherchainV1, ...etherchainV2, ...ethers, ...etherscan, ...ethgasstation]
  const avg = average(transactionCosts)
  const timestamp = Date.now()
  const payload = new XyoPayloadBuilder<XyoEthereumGasPayload>({ schema: XyoEthereumGasSchema }).fields({ ...avg, timestamp }).build()
  return payload
}
