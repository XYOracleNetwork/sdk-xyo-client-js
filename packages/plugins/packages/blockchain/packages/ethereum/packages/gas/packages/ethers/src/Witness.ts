import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthersWitnessConfig } from './Config'
import { getGasFromEthers } from './lib'
import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema, XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEthersWitness extends XyoTimestampWitness<XyoEthereumGasEthersPayload, XyoEthereumGasEthersWitnessConfig> {
  static override configSchema = XyoEthereumGasEthersWitnessConfigSchema
  static override targetSchema = XyoEthereumGasEthersSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthersWitnessConfig>): Promise<XyoEthereumGasEthersWitness> {
    assertEx(params?.config?.apiKey, 'apiKey is required')
    return (await super.create(params)) as XyoEthereumGasEthersWitness
  }

  override async observe(): Promise<XyoEthereumGasEthersPayload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    return super.observe([await getGasFromEthers(apiKey)])
  }
}
