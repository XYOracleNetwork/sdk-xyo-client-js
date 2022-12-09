import { IdPayload, IdSchema } from '@xyo-network/id-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

export type IdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const IdWitnessConfigSchema: IdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type IdWitnessConfig = XyoWitnessConfig<{
  salt: string
  schema: IdWitnessConfigSchema
}>

export class IdWitness extends AbstractWitness<IdWitnessConfig> {
  static override configSchema = IdWitnessConfigSchema

  public get salt() {
    return this.config?.salt ?? `${Math.floor(Math.random() * 9999999)}`
  }

  static override async create(params?: XyoModuleParams<IdWitnessConfig>): Promise<IdWitness> {
    return (await super.create(params)) as IdWitness
  }

  override async observe(payloads: IdPayload[] = []): Promise<XyoPayload[]> {
    return await super.observe(
      payloads.length > 0
        ? payloads.map((fieldItems) => {
            return {
              salt: fieldItems?.salt ?? this.salt,
              schema: IdSchema,
            }
          })
        : [
            {
              salt: this.salt,
              schema: IdSchema,
            },
          ],
    )
  }
}
