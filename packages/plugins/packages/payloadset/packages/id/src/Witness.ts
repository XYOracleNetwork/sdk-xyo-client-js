import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { IdPayload, IdSchema } from '@xyo-network/id-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessParams } from '@xyo-network/witness-model'

export type IdWitnessConfigSchema = 'network.xyo.id.witness.config'
export const IdWitnessConfigSchema: IdWitnessConfigSchema = 'network.xyo.id.witness.config'

export type IdWitnessConfig = WitnessConfig<{
  salt?: string
  schema: IdWitnessConfigSchema
}>

export type IdWitnessParams = WitnessParams<AnyConfigSchema<IdWitnessConfig>>

export class IdWitness<TParams extends IdWitnessParams = IdWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [IdWitnessConfigSchema]

  get salt() {
    return this.config?.salt ?? `${Math.floor(Math.random() * 9999999)}`
  }

  protected override observeHandler(payloads: Payload[] = []): Promisable<Payload[]> {
    return payloads.length > 0
      ? (payloads as IdPayload[]).map((fieldItems) => {
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
        ]
  }
}
