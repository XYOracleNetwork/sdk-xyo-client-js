import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'

export type XyoSchemaWitnessConfig = XyoWitnessConfig

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload> implements XyoWitness<XyoSchemaPayload, XyoSchemaWitnessConfig> {
  override async observe(_fields: Partial<XyoSchemaPayload>): Promise<XyoSchemaPayload> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
  static schema: XyoSchemaPayloadSchema = XyoSchemaPayloadSchema
}
