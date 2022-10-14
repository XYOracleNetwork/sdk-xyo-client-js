import { assertEx } from '@xylabs/assert'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'

export class XyoEtherscanEthereumGasWitness extends XyoTimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
  override async observe(): Promise<XyoEthereumGasEtherscanPayload[]> {
    const result = (await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))).result
    return super.observe([result])
  }
}
