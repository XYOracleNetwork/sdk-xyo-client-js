import { EthereumGasPayload, EthereumGasSchema, FeeData } from '@xyo-network/gas-price-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { average } from './average'
import {
  isEthereumGasBlocknativePayload,
  isEthereumGasEtherchainV2Payload,
  isEthereumGasEtherscanPayload,
  isEthereumGasEthersPayload,
  isEthereumGasEthgasstationPayload,
} from './identities'
import {
  transformGasFromBlocknative,
  transformGasFromEtherchainV2,
  transformGasFromEthers,
  transformGasFromEtherscan,
  transformGasFromEthgasstation,
} from './transforms'

export const divineGas = (payloads: Payload[]): EthereumGasPayload => {
  const blocknative = payloads.filter(isEthereumGasBlocknativePayload).map(transformGasFromBlocknative)
  const etherchainV2 = payloads.filter(isEthereumGasEtherchainV2Payload).map(transformGasFromEtherchainV2)
  const ethers = payloads.filter(isEthereumGasEthersPayload).map(transformGasFromEthers)
  const etherscan = payloads.filter(isEthereumGasEtherscanPayload).map(transformGasFromEtherscan)
  const ethgasstation = payloads.filter(isEthereumGasEthgasstationPayload).map(transformGasFromEthgasstation)
  const transactionCosts: FeeData[] = [...blocknative, ...etherchainV2, ...ethers, ...etherscan, ...ethgasstation]
  const avg = average(transactionCosts)
  const timestamp = Date.now()
  const payload = new PayloadBuilder<EthereumGasPayload>({ schema: EthereumGasSchema }).fields({ ...avg, timestamp }).build()
  return payload
}
