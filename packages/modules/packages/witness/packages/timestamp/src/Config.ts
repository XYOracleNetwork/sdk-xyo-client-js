import { WithAdditional } from '@xylabs/object'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

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
