import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfigSchema, WitnessParams } from '@xyo-network/witness-model'

import { NonFungibleTokenPayload } from './Config'

export class NonFungibleTokenWitness extends AbstractWitness<WitnessParams<NonFungibleTokenPayload>> {
  static override configSchemas = [WitnessConfigSchema]

  protected override observeHandler(_payloads?: Payload[]): Promise<Payload[]> {
    throw new Error('Method not implemented.')
  }
}
