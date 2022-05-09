import merge from 'lodash/merge'

import { XyoWitness } from '../../core'
import { XyoSchemaPayload } from './Payload'
import { schemaTemplate } from './Template'

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload> {
  constructor() {
    super({
      schema: 'network.xyo.schema',
      template: schemaTemplate,
    })
  }

  override async observe(fields: { definition: Record<string, unknown> }): Promise<XyoSchemaPayload> {
    return await super.observe(merge({}, schemaTemplate, fields))
  }
}
