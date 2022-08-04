import { XyoSimpleWitness } from '@xyo-network/witness'
import { v4 as uuid } from 'uuid'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'

export class XyoIdWitness extends XyoSimpleWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    const template = XyoIdPayloadTemplate()
    super({
      schema: template.schema,
      template,
    })
    this.salt = salt
  }

  override async observe(): Promise<XyoIdPayload> {
    return await super.observe({
      salt: this.salt,
    })
  }

  static schema: XyoIdPayloadSchema = XyoIdPayloadSchema
}
