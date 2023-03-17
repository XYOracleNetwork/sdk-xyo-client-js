import {
  XyoEthereumGasEthgasstationPayload,
  XyoEthereumGasEthgasstationSchema,
  XyoEthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { getGasFromEthgasstation } from './lib'

export type XyoEthereumGasEthgasstationWitnessParams = WitnessParams<AnyConfigSchema<XyoEthereumGasEthgasstationWitnessConfig>>
export class XyoEthereumGasEthgasstationWitness<TParams extends XyoEthereumGasEthgasstationWitnessParams = XyoEthereumGasEthgasstationWitnessParams>
  extends TimestampWitness<TParams>
  implements WitnessModule
{
  static override configSchema: string = XyoEthereumGasEthgasstationWitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const payload = new PayloadBuilder<XyoEthereumGasEthgasstationPayload>({ schema: XyoEthereumGasEthgasstationSchema })
      .fields(await getGasFromEthgasstation())
      .build()
    return super.observe([payload])
  }
}
