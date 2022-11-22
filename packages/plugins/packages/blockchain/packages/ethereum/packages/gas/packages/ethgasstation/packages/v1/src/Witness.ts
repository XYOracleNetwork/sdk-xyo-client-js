import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationV1WitnessConfig } from './Config'
import { getV1GasFromEthgasstation } from './lib'
import { XyoEthereumGasEthgasstationV1Payload } from './Payload'
import { XyoEthereumGasEthgasstationV1Schema, XyoEthereumGasEthgasstationV1WitnessConfigSchema } from './Schema'

export class XyoEthgasstationEthereumGasWitnessV1 extends XyoTimestampWitness<
  XyoEthereumGasEthgasstationV1Payload,
  XyoEthereumGasEthgasstationV1WitnessConfig
> {
  static override configSchema = XyoEthereumGasEthgasstationV1WitnessConfigSchema
  static override targetSchema = XyoEthereumGasEthgasstationV1Schema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthgasstationV1WitnessConfig>): Promise<XyoEthgasstationEthereumGasWitnessV1> {
    return (await super.create(params)) as XyoEthgasstationEthereumGasWitnessV1
  }

  override async observe(): Promise<XyoEthereumGasEthgasstationV1Payload[]> {
    return super.observe([await getV1GasFromEthgasstation()])
  }
}
