import type { WithAdditional } from '@xylabs/sdk-js'
import { asSchema, type Payload } from '@xyo-network/payload-model'
import type { WitnessConfig } from '@xyo-network/witness-model'

export const TimestampWitnessConfigSchema = asSchema('network.xyo.witness.timestamp.config', true)
export type TimestampWitnessConfigSchema = typeof TimestampWitnessConfigSchema

export type TimestampWitnessConfig<TConfig extends Payload | undefined = undefined> = WitnessConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : TimestampWitnessConfigSchema
    },
    TConfig
  >
>
