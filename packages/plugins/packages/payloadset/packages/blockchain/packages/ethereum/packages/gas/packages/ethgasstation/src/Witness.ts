import {
  EthereumGasEthgasstationPayload,
  EthereumGasEthgasstationSchema,
  EthereumGasEthgasstationWitnessConfigSchema,
} from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { EthereumGasEthgasstationWitnessConfig } from './Config'
import { getGasFromEthgasstation } from './lib'

export type EthereumGasEthgasstationWitnessParams = WitnessParams<AnyConfigSchema<EthereumGasEthgasstationWitnessConfig>>
export class EthereumGasEthgasstationWitness<TParams extends EthereumGasEthgasstationWitnessParams = EthereumGasEthgasstationWitnessParams>
  extends TimestampWitness<TParams>
  implements WitnessModule
{
  static override readonly configSchemas: string[] = [EthereumGasEthgasstationWitnessConfigSchema]

  protected override async observeHandler(): Promise<Payload[]> {
    const payload = new PayloadBuilder<EthereumGasEthgasstationPayload>({ schema: EthereumGasEthgasstationSchema })
      .fields(await getGasFromEthgasstation())
      .build()
    return super.observeHandler([payload])
  }
}
