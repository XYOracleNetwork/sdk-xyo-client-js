import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoPluginPayload } from './Payload'

export class XyoNonFungibleTokenWitness extends AbstractWitness<XyoPluginPayload> {
  static override configSchema = XyoWitnessConfigSchema

  override observe(_payloads: XyoPayload[]): Promise<XyoPluginPayload[]> {
    throw new Error('Method not implemented.')
  }
}
