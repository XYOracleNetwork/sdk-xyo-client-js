import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends AbstractWitness<XyoNonFungibleTokenPayload> {
  static override configSchema = XyoWitnessConfigSchema

  override observe(_payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    throw new Error('Method not implemented.')
  }
}
