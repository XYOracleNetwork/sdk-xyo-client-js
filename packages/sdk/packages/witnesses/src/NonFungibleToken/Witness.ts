import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends AbstractWitness<WitnessParams<XyoNonFungibleTokenPayload>> {
  static override configSchema = XyoWitnessConfigSchema

  override observe(_payloads?: Payload[]): Promise<Payload[]> {
    throw new Error('Method not implemented.')
  }
}
