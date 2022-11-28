import { XyoModuleParams } from '@xyo-network/module'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { getGasFromBlocknative } from './lib'
import { XyoEthereumGasBlocknativePayload } from './Payload'
import { XyoEthereumGasBlocknativeSchema, XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export class XyoEthereumGasBlocknativeWitness extends TimestampWitness<XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeWitnessConfig> {
  static override configSchema = XyoEthereumGasBlocknativeWitnessConfigSchema
  static override targetSchema = XyoEthereumGasBlocknativeSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasBlocknativeWitnessConfig>): Promise<XyoEthereumGasBlocknativeWitness> {
    return (await super.create(params)) as XyoEthereumGasBlocknativeWitness
  }

  override async observe(): Promise<XyoEthereumGasBlocknativePayload[]> {
    return super.observe([await getGasFromBlocknative()])
  }
}
