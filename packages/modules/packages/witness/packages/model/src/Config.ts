import { EmptyObject, WithAdditional } from '@xylabs/object'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export const WitnessConfigSchema = 'network.xyo.witness.config'
export type WitnessConfigSchema = typeof WitnessConfigSchema

export type WitnessConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : WitnessConfigSchema
    },
    TConfig
  >,
  TSchema
>
