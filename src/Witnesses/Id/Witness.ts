import { v4 as uuid } from 'uuid'

import { XyoWitness } from '../../XyoWitness'
import { XyoIdPayload } from './Payload'

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    super({
      schema: 'network.xyo.id',
    })
    this.salt = salt
  }

  override async observe(): Promise<XyoIdPayload> {
    return await super.observe({
      salt: this.salt,
    })
  }
}
