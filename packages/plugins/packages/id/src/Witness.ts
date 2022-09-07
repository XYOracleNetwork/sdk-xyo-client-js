import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'

export type XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const XyoIdWitnessConfigSchema: XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type XyoIdWitnessConfig = XyoWitnessConfig<
  XyoIdPayload,
  {
    schema: XyoIdWitnessConfigSchema
    salt: string
  }
>

export class XyoIdWitness extends XyoWitness<XyoIdPayload, XyoIdWitnessConfig> {
  public get salt() {
    return this.config.salt
  }

  override async observe(_fields?: Partial<XyoIdPayload>): Promise<XyoIdPayload> {
    await delay(0)
    return {
      salt: this.salt,
      schema: 'network.xyo.id',
    }
  }

  static schema: XyoIdSchema = XyoIdSchema
}
