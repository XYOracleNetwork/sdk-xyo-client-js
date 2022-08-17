import { delay } from '@xylabs/delay'
import { uuid } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'

export interface XyoIdWitnessConfig extends XyoWitnessConfig {
  salt?: string
}

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor({ salt, ...config }: XyoIdWitnessConfig) {
    super(config)
    this.salt = salt ?? uuid()
  }

  override async observe(
    _fields?: Partial<XyoIdPayload>,
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
