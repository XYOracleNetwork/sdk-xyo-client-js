import { XyoSimpleWitness, XyoWitness } from '@xyo-network/witness'
import merge from 'lodash/merge'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaPayloadTemplate } from './Template'

export class XyoSchemaWitness extends XyoSimpleWitness<XyoSchemaPayload> implements XyoWitness<XyoSchemaPayload> {
  constructor() {
    super({
      schema: XyoSchemaPayloadSchema,
      template: XyoSchemaPayloadTemplate(),
    })
  }

  override async observe(fields: XyoSchemaPayload): Promise<XyoSchemaPayload> {
    return await super.observe(merge({}, this.config?.template, fields))
  }

  static schema: XyoSchemaPayloadSchema = XyoSchemaPayloadSchema
}
