import { assertEx } from '@xylabs/sdk-js'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { getGasFromEtherscan } from './getGasFromEtherscan'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { transformGasFromEtherscan } from './transformGasFromEtherscan'

export type XyoEtherscanEthereumGasWitnessConfig = XyoWitnessConfig<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherscan.config'
  apiKey: string
}>

export class XyoEtherscanEthereumGasWitness extends XyoWitness<XyoEthereumGasEtherscanPayload, XyoEtherscanEthereumGasWitnessConfig> {
  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    const result = await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))
    const transformed = transformGasFromEtherscan(result)
    return {
      ...transformed,
      schema: 'network.xyo.blockchain.ethereum.gas.etherscan',
      timestamp: Date.now(),
    }
  }
}
