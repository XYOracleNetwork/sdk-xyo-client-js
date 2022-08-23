import { delay } from '@xylabs/delay'
import { uuid } from '@xyo-network/core'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'

export type XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const XyoIdWitnessConfigSchema: XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type XyoIdWitnessConfig = XyoWitnessConfig<{
  schema: XyoIdWitnessConfigSchema
  targetSchema: XyoIdPayloadSchema
  salt?: string
}>

export class XyoIdWitness extends XyoWitness<XyoIdPayload> {
  private salt: string

  constructor({ salt, ...config }: XyoIdWitnessConfig) {
    super(config)
    this.salt = salt ?? uuid()
  }

  override async observe(_fields?: Partial<XyoIdPayload>): Promise<XyoIdPayload> {
    await delay(0)
    return {
      salt: this.salt,
      schema: 'network.xyo.id',
    }
  }

  static schema: XyoIdPayloadSchema = XyoIdPayloadSchema
}
