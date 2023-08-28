import { AbstractWitness } from '@xyo-network/abstract-witness'
import { WithAdditional } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { WitnessConfig, WitnessConfigSchema, WitnessParams } from '@xyo-network/witness-model'

export const TimestampWitnessConfigSchema = 'network.xyo.witness.timestamp.config'
export type TimestampWitnessConfigSchema = typeof TimestampWitnessConfigSchema

export type TimestampWitnessConfig<TConfig extends Payload | undefined = undefined> = WitnessConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : TimestampWitnessConfigSchema
    },
    TConfig
  >
>

export type TimestampWitnessParams<TConfig extends AnyConfigSchema<TimestampWitnessConfig> = AnyConfigSchema<TimestampWitnessConfig>> =
  WitnessParams<TConfig>

export abstract class TimestampWitness<P extends TimestampWitnessParams = TimestampWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [TimestampWitnessConfigSchema, WitnessConfigSchema]
  protected override observeHandler(fields?: Payload[]): Promisable<Payload[]> {
    return (
      fields?.map((fieldItem) => {
        return { ...fieldItem, timestamp: Date.now() }
      }) ?? []
    )
  }
}
