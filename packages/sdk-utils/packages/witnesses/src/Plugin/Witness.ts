import { AbstractWitness } from '@xyo-network/abstract-witness'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type { WitnessParams } from '@xyo-network/witness-model'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import type { PluginPayload } from './Payload.ts'

export class NonFungibleTokenWitness extends AbstractWitness<WitnessParams<PluginPayload>> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, WitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = WitnessConfigSchema

  protected override observeHandler(_payloads: Payload[]): Promise<PluginPayload[]> {
    throw new Error('Method not implemented.')
  }
}
