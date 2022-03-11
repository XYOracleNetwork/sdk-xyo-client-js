import { v4 as uuid } from 'uuid'

import { XyoWitness } from '../../Witness'
import { XyoIdPayload } from './Payload'

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    super({
      schema: XyoIdWitness.schema,
    })
    this.salt = salt
  }

  override async observe(): Promise<XyoIdPayload> {
    return await super.observe({
      salt: this.salt,
    })
  }

  public static schema = 'network.xyo.id'
}
