import {
  XyoEthereumGasEthgasstationPayload,
  XyoEthereumGasEthgasstationSchema,
  XyoEthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { getGasFromEthgasstation } from './lib'

export class XyoEthereumGasEthgasstationWitness extends TimestampWitness<XyoEthereumGasEthgasstationWitnessConfig> {
  static override configSchema = XyoEthereumGasEthgasstationWitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthgasstationWitnessConfig>): Promise<XyoEthereumGasEthgasstationWitness> {
    return (await super.create(params)) as XyoEthereumGasEthgasstationWitness
  }

  override async observe(): Promise<XyoPayload[]> {
    const payload = new XyoPayloadBuilder<XyoEthereumGasEthgasstationPayload>({ schema: XyoEthereumGasEthgasstationSchema })
      .fields(await getGasFromEthgasstation())
      .build()
    return super.observe([payload])
  }
}
