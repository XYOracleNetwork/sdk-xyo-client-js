import { EthereumGasBlocknativePayload, EthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { EthereumGasBlocknativeWitnessConfig } from './Config'
import { getGasFromBlocknative } from './lib'
import { EthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type EthereumGasBlocknativeWitnessParams = WitnessParams<AnyConfigSchema<EthereumGasBlocknativeWitnessConfig>>
export class EthereumGasBlocknativeWitness extends TimestampWitness<EthereumGasBlocknativeWitnessParams> {
  static override configSchema = EthereumGasBlocknativeWitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const fields = await getGasFromBlocknative()
    const payload = new PayloadBuilder<EthereumGasBlocknativePayload>({
      schema: EthereumGasBlocknativeSchema,
    })
      .fields(fields)
      .build()
    return super.observe([payload])
  }
}
