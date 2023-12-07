import { WithAdditional } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

export const EnvironmentWitnessConfigSchema = 'network.xyo.witness.environment.config'
export type EnvironmentWitnessConfigSchema = typeof EnvironmentWitnessConfigSchema

export type EnvironmentWitnessConfig<TConfig extends Payload | undefined = undefined> = WitnessConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : EnvironmentWitnessConfigSchema
    },
    TConfig
  >
>
