import { XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { getGasFromBlocknative } from './lib'
import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type XyoEthereumGasBlocknativeWitnessParams = WitnessParams<AnyConfigSchema<XyoEthereumGasBlocknativeWitnessConfig>>
export class XyoEthereumGasBlocknativeWitness extends TimestampWitness<XyoEthereumGasBlocknativeWitnessParams> {
  static override configSchema = XyoEthereumGasBlocknativeWitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const fields = await getGasFromBlocknative()
    const payload = new PayloadBuilder<XyoEthereumGasBlocknativePayload>({
      schema: XyoEthereumGasBlocknativeSchema,
    })
      .fields(fields)
      .build()
    return super.observe([payload])
  }
}
