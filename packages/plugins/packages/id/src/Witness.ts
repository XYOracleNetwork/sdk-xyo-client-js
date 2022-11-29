import { XyoModuleParams } from '@xyo-network/module'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'

export type XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const XyoIdWitnessConfigSchema: XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type XyoIdWitnessConfig = XyoWitnessConfig<
  XyoIdPayload,
  {
    salt: string
    schema: XyoIdWitnessConfigSchema
  }
>

export class XyoIdWitness extends AbstractWitness<XyoIdPayload, XyoIdWitnessConfig> {
  static override configSchema = XyoIdWitnessConfigSchema
  static override targetSchema = XyoIdSchema

  public get salt() {
    return this.config?.salt ?? `${Math.floor(Math.random() * 9999999)}`
  }

  static override async create(params?: XyoModuleParams<XyoIdWitnessConfig>): Promise<XyoIdWitness> {
    return (await super.create(params)) as XyoIdWitness
  }

  override async observe(fields?: Partial<XyoIdPayload>[]): Promise<XyoIdPayload[]> {
    return await super.observe(
      fields
        ? fields.map((fieldItems) => {
            return {
              salt: fieldItems?.salt ?? this.salt,
              schema: XyoIdSchema,
            }
          })
        : [
            {
              salt: this.salt,
              schema: XyoIdSchema,
            },
          ],
    )
  }
}
