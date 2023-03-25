import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends AbstractWitness<WitnessParams<XyoNonFungibleTokenPayload>> {
  static override configSchema = WitnessConfigSchema

  override observe(_payloads?: Payload[]): Promise<Payload[]> {
    throw new Error('Method not implemented.')
  }
}
