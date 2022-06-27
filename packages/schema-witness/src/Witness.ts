import { XyoSchemaPayload } from '@xyo-network/payload'
import { XyoSimpleWitness } from '@xyo-network/witnesses'
import merge from 'lodash/merge'

import { schemaTemplate } from './Template'

const template = schemaTemplate()

export class XyoSchemaWitness extends XyoSimpleWitness<XyoSchemaPayload> {
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
