import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationV2WitnessConfig } from './Config'
import { getV2GasFromEthgasstation } from './lib'
import { XyoEthereumGasEthgasstationV2Payload } from './Payload'
import { XyoEthereumGasEthgasstationV2Schema, XyoEthereumGasEthgasstationV2WitnessConfigSchema } from './Schema'

export class XyoEthgasstationEthereumGasWitnessV2 extends XyoTimestampWitness<
  XyoEthereumGasEthgasstationV2Payload,
  XyoEthereumGasEthgasstationV2WitnessConfig
> {
  static override configSchema = XyoEthereumGasEthgasstationV2WitnessConfigSchema
  static override targetSchema = XyoEthereumGasEthgasstationV2Schema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthgasstationV2WitnessConfig>): Promise<XyoEthgasstationEthereumGasWitnessV2> {
    return (await super.create(params)) as XyoEthgasstationEthereumGasWitnessV2
  }

  override async observe(): Promise<XyoEthereumGasEthgasstationV2Payload[]> {
    return super.observe([await getV2GasFromEthgasstation()])
  }
}
