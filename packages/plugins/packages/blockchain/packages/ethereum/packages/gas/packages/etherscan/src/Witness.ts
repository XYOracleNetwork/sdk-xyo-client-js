import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEtherscanEthereumGasWitness extends XyoTimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
  static override configSchema = XyoEthereumGasEtherscanWitnessConfigSchema
  static override targetSchema = XyoEthereumGasEtherscanSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherscanWitnessConfig>): Promise<XyoEtherscanEthereumGasWitness> {
    assertEx(params?.config?.apiKey, 'apiKey is required')
    return (await super.create(params)) as XyoEtherscanEthereumGasWitness
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload[]> {
    const result = (await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))).result
    return super.observe([result])
  }
}
