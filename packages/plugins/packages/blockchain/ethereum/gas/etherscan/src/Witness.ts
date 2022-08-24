import { assertEx } from '@xylabs/sdk-js'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { getGasFromEtherscan, transformGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'

export type XyoEtherscanEthereumGasWitnessConfigSchema = 'network.xyo.blockchain.ethereum.gas.etherscan.witness.config'
export const XyoEtherscanEthereumGasWitnessConfigSchema: XyoEtherscanEthereumGasWitnessConfigSchema =
  'network.xyo.blockchain.ethereum.gas.etherscan.witness.config'

export type XyoEtherscanEthereumGasWitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEtherscanPayload,
  {
    schema: XyoEtherscanEthereumGasWitnessConfigSchema
    apiKey: string
  }
>

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
