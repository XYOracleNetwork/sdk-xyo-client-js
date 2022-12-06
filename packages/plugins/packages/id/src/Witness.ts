import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'

export type XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const XyoIdWitnessConfigSchema: XyoIdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type XyoIdWitnessConfig = XyoWitnessConfig<{
  salt: string
  schema: XyoIdWitnessConfigSchema
}>

export class XyoIdWitness extends AbstractWitness<XyoIdWitnessConfig> {
  static override configSchema = XyoIdWitnessConfigSchema

  public get salt() {
    return this.config?.salt ?? `${Math.floor(Math.random() * 9999999)}`
  }

  static override async create(params?: XyoModuleParams<XyoIdWitnessConfig>): Promise<XyoIdWitness> {
    return (await super.create(params)) as XyoIdWitness
  }

  override async observe(payloads: XyoIdPayload[] = []): Promise<XyoPayload[]> {
    return await super.observe(
      payloads.length > 0
        ? payloads.map((fieldItems) => {
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
