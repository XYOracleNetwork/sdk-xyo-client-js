import { XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { getGasFromBlocknative } from './lib'
import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type XyoEthereumGasBlocknativeWitnessParams = WitnessParams<AnyConfigSchema<XyoEthereumGasBlocknativeWitnessConfig>>
export class XyoEthereumGasBlocknativeWitness extends TimestampWitness<XyoEthereumGasBlocknativeWitnessParams> {
  static override configSchema = XyoEthereumGasBlocknativeWitnessConfigSchema

  static override async create<TParams extends XyoEthereumGasBlocknativeWitnessParams>(params?: TParams) {
    return await super.create(params)
  }

  override async observe(): Promise<XyoPayload[]> {
    const fields = await getGasFromBlocknative()
    const payload = new XyoPayloadBuilder<XyoEthereumGasBlocknativePayload>({
      schema: XyoEthereumGasBlocknativeSchema,
    })
      .fields(fields)
      .build()
    return super.observe([payload])
  }
}
