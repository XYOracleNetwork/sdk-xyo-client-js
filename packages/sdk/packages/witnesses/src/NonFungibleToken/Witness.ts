import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness'

import { NonFungibleTokenPayload } from './Config'

export class NonFungibleTokenWitness extends AbstractWitness<WitnessParams<NonFungibleTokenPayload>> {
  static override configSchema = WitnessConfigSchema

  override observe(_payloads?: Payload[]): Promise<Payload[]> {
    throw new Error('Method not implemented.')
  }
}
