import { XyoWitness } from '@xyo-network/core'
import merge from 'lodash/merge'

import { XyoSchemaPayload } from './Payload'
import { schemaTemplate } from './Template'

const template = schemaTemplate()

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload> {
  constructor() {
    super({
      schema: template.schema,
      template,
    })
  }

  override async observe(fields: { definition: Record<string, unknown> }): Promise<XyoSchemaPayload> {
    return await super.observe(merge({}, template, fields))
  }
}
