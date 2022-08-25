import { assertEx } from '@xylabs/sdk-js'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan, transformGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'

export class XyoEtherscanEthereumGasWitness extends XyoTimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
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
