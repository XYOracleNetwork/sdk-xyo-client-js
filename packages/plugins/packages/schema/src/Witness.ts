import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'

export type XyoSchemaWitnessConfig = XyoWitnessConfig

export type XyoSchemaWitnessQueryPayload = XyoWitnessQueryPayload

export class XyoSchemaWitness
  extends XyoWitness<XyoSchemaPayload>
  implements XyoWitness<XyoSchemaPayload, XyoSchemaWitnessQueryPayload, XyoSchemaWitnessConfig>
{
  override async observe(
    _fields: Partial<XyoSchemaPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoSchemaPayload> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
  static schema: XyoSchemaPayloadSchema = XyoSchemaPayloadSchema
}
