import merge from 'lodash/merge'

import { XyoWitness } from '../../XyoWitness'
import { XyoSchemaPayload } from './Payload'

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload> {
  constructor() {
    super({
      schema: XyoSchemaWitness.schema,
    })
  }

  override async observe(fields: { definition: Record<string, unknown> }): Promise<XyoSchemaPayload> {
    return await super.observe(merge({}, XyoSchemaWitness.template, fields))
  }

  public static schema = 'network.xyo.schema'

  public static template = {
    definition: {
      $schema: 'http://json-schema.org/draft-07/schema#',
    },
    schema: this.schema,
  }
}
