import type { WithAdditional } from '@xylabs/object'
import type { Payload } from '@xyo-network/payload-model'
import type { WitnessConfig } from '@xyo-network/witness-model'

export const EnvironmentWitnessConfigSchema = 'network.xyo.witness.environment.config' as const
export type EnvironmentWitnessConfigSchema = typeof EnvironmentWitnessConfigSchema

export type EnvironmentWitnessConfig<TConfig extends Payload | undefined = undefined> = WitnessConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : EnvironmentWitnessConfigSchema
    },
    TConfig
  >
>
