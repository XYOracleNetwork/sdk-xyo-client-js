import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { getGasFromEthgasstation } from './lib'
import { XyoEthereumGasEthgasstationPayload } from './Payload'
import { XyoEthereumGasEthgasstationSchema, XyoEthereumGasEthgasstationWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEthgasstationWitness extends XyoTimestampWitness<
  XyoEthereumGasEthgasstationPayload,
  XyoEthereumGasEthgasstationWitnessConfig
> {
  static override configSchema = XyoEthereumGasEthgasstationWitnessConfigSchema
  static override targetSchema = XyoEthereumGasEthgasstationSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthgasstationWitnessConfig>): Promise<XyoEthereumGasEthgasstationWitness> {
    return (await super.create(params)) as XyoEthereumGasEthgasstationWitness
  }

  override async observe(): Promise<XyoEthereumGasEthgasstationPayload[]> {
    return super.observe([await getGasFromEthgasstation()])
  }
}
