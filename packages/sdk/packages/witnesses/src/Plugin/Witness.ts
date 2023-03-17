import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoPluginPayload } from './Payload'

export class XyoNonFungibleTokenWitness extends AbstractWitness<WitnessParams<XyoPluginPayload>> {
  static override configSchema = XyoWitnessConfigSchema

  override observe(_payloads: Payload[]): Promise<XyoPluginPayload[]> {
    throw new Error('Method not implemented.')
  }
}
