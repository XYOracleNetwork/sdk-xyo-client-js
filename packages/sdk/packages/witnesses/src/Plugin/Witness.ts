import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness'

import { PluginPayload } from './Payload'

export class NonFungibleTokenWitness extends AbstractWitness<WitnessParams<PluginPayload>> {
  static override configSchema = WitnessConfigSchema

  override observe(_payloads: Payload[]): Promise<PluginPayload[]> {
    throw new Error('Method not implemented.')
  }
}
