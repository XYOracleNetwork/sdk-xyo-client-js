import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'

export class XyoEtherscanEthereumGasWitness extends XyoTimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherscanWitnessConfig>): Promise<XyoEtherscanEthereumGasWitness> {
    const module = new XyoEtherscanEthereumGasWitness(params)
    await module.start()
    return module
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload[]> {
    const result = (await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))).result
    return super.observe([result])
  }
}
