import { XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { getGasFromBlocknative } from './lib'
import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export class XyoEthereumGasBlocknativeWitness extends TimestampWitness<XyoEthereumGasBlocknativeWitnessConfig> {
  static override configSchema = XyoEthereumGasBlocknativeWitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasBlocknativeWitnessConfig>): Promise<XyoEthereumGasBlocknativeWitness> {
    return (await super.create(params)) as XyoEthereumGasBlocknativeWitness
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
