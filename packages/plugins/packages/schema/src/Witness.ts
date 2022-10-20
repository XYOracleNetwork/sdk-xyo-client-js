import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaSchema } from './Schema'

export type XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'
export const XyoSchemaWitnessConfigSchema: XyoSchemaWitnessConfigSchema = 'network.xyo.schema.witness.config'

export type XyoSchemaWitnessConfig = XyoWitnessConfig<XyoSchemaPayload, { schema: XyoSchemaWitnessConfigSchema }>

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload, XyoSchemaWitnessConfig> {
  override async observe(_fields: Partial<XyoSchemaPayload>[]): Promise<XyoSchemaPayload[]> {
    await delay(0)
    throw new Error('Method not implemented.')
  }
  static schema: XyoSchemaSchema = XyoSchemaSchema
}
