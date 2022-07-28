import { XyoSchemaPayload } from '@xyo-network/payload'
import { XyoSimpleWitness, XyoWitness } from '@xyo-network/witnesses'
import merge from 'lodash/merge'

import { schemaTemplate } from './Template'

const template = schemaTemplate()

export class XyoSchemaWitness extends XyoSimpleWitness<XyoSchemaPayload> implements XyoWitness<XyoSchemaPayload> {
  constructor() {
    super({
      schema: template.schema,
      template,
    })
  }

  override async observe(fields: XyoSchemaPayload): Promise<XyoSchemaPayload> {
    return await super.observe(merge({}, template, fields))
  }
}
