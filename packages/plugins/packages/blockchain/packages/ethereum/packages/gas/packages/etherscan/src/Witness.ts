import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEtherscanWitness extends TimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
  static override configSchema = XyoEthereumGasEtherscanWitnessConfigSchema
  static override targetSchema = XyoEthereumGasEtherscanSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherscanWitnessConfig>): Promise<XyoEthereumGasEtherscanWitness> {
    assertEx(params?.config?.apiKey, 'apiKey is required')
    return (await super.create(params)) as XyoEthereumGasEtherscanWitness
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    return super.observe([await getGasFromEtherscan(apiKey)])
  }
}
