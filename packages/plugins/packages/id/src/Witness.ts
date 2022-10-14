import { assertEx } from '@xylabs/assert'
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
    return this.config?.salt ?? `${Math.floor(Math.random() * 9999999)}`
  }

  override async observe(fields: Partial<XyoIdPayload>[]): Promise<XyoIdPayload[]> {
    await delay(0)
    return fields.map((fieldItems) => {
      return {
        salt: assertEx(fieldItems?.salt ?? this.salt, 'Missing salt'),
        schema: 'network.xyo.id',
      }
    })
  }

  static schema: XyoIdSchema = XyoIdSchema
}
