import { v4 as uuid } from 'uuid'

import { XyoWitness } from '../../core'
import { XyoIdPayload } from './Payload'
import { idTemplate } from './Template'

const template = idTemplate()

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
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
}
