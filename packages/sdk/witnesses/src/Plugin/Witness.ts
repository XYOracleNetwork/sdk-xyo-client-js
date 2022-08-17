import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoPluginPayload } from './Payload'

export class XyoNonFungibleTokenWitness extends XyoWitness<XyoPluginPayload> {
  observe(
    _fields: Partial<XyoPluginPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoPluginPayload> {
    throw new Error('Method not implemented.')
  }
}
