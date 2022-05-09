import { v4 as uuid } from 'uuid'

import { XyoWitness } from '../../core'
import { XyoIdPayload } from './Payload'
import { idTemplate } from './Template'

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    super({
      schema: 'network.xyo.id',
      template: idTemplate,
    })
    this.salt = salt
  }

  override async observe(): Promise<XyoIdPayload> {
    return await super.observe({
      salt: this.salt,
    })
  }
}
