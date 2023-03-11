import {
  XyoEthereumGasEthgasstationPayload,
  XyoEthereumGasEthgasstationSchema,
  XyoEthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { getGasFromEthgasstation } from './lib'

export type XyoEthereumGasEthgasstationWitnessParams = WitnessParams<AnyConfigSchema<XyoEthereumGasEthgasstationWitnessConfig>>
export class XyoEthereumGasEthgasstationWitness<TParams extends XyoEthereumGasEthgasstationWitnessParams = XyoEthereumGasEthgasstationWitnessParams>
  extends TimestampWitness<TParams>
  implements WitnessModule
{
  static override configSchema: string = XyoEthereumGasEthgasstationWitnessConfigSchema

  static override async create<TParams extends XyoEthereumGasEthgasstationWitnessParams>(params?: TParams) {
    return (await super.create(params)) as WitnessModule
  }

  override async observe(): Promise<XyoPayload[]> {
    const payload = new XyoPayloadBuilder<XyoEthereumGasEthgasstationPayload>({ schema: XyoEthereumGasEthgasstationSchema })
      .fields(await getGasFromEthgasstation())
      .build()
    return super.observe([payload])
  }
}
