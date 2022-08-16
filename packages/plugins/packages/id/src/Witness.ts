import { delay } from '@xylabs/delay'
import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'
import { v4 as uuid } from 'uuid'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor(salt = uuid()) {
    super({ account: new XyoAccount(), schema: 'network.xyo.id.config' })
    this.salt = salt
  }

  override async observe(
    _fields: Partial<XyoIdPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoIdPayload> {
    await delay(0)
    return {
      salt: this.salt,
      schema: 'network.xyo.id',
    }
  }

  static schema: XyoIdPayloadSchema = XyoIdPayloadSchema
}
