import { FeeData, XyoEthereumGasPayload, XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { average } from './average'
import {
  isXyoEthereumGasBlocknativePayload,
  isXyoEthereumGasEtherchainV2Payload,
  isXyoEthereumGasEtherscanPayload,
  isXyoEthereumGasEthersPayload,
  isXyoEthereumGasEthgasstationPayload,
} from './identities'
import {
  transformGasFromBlocknative,
  transformGasFromEtherchainV2,
  transformGasFromEthers,
  transformGasFromEtherscan,
  transformGasFromEthgasstation,
} from './transforms'

export const divineGas = (payloads: Payload[]): XyoEthereumGasPayload => {
  const blocknative = payloads.filter(isXyoEthereumGasBlocknativePayload).map(transformGasFromBlocknative)
  const etherchainV2 = payloads.filter(isXyoEthereumGasEtherchainV2Payload).map(transformGasFromEtherchainV2)
  const ethers = payloads.filter(isXyoEthereumGasEthersPayload).map(transformGasFromEthers)
  const etherscan = payloads.filter(isXyoEthereumGasEtherscanPayload).map(transformGasFromEtherscan)
  const ethgasstation = payloads.filter(isXyoEthereumGasEthgasstationPayload).map(transformGasFromEthgasstation)
  const transactionCosts: FeeData[] = [...blocknative, ...etherchainV2, ...ethers, ...etherscan, ...ethgasstation]
  const avg = average(transactionCosts)
  const timestamp = Date.now()
  const payload = new PayloadBuilder<XyoEthereumGasPayload>({ schema: XyoEthereumGasSchema }).fields({ ...avg, timestamp }).build()
  return payload
}
