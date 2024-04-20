import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload, Schema } from '@xyo-network/payload-model'
import { WitnessConfigSchema, WitnessParams } from '@xyo-network/witness-model'

import { PluginPayload } from './Payload'

export class NonFungibleTokenWitness extends AbstractWitness<WitnessParams<PluginPayload>> {
  static override configSchemas: Schema[] = [...super.configSchemas, WitnessConfigSchema]
  static override defaultConfigSchema: Schema = WitnessConfigSchema

  protected override observeHandler(_payloads: Payload[]): Promise<PluginPayload[]> {
    throw new Error('Method not implemented.')
  }
}
