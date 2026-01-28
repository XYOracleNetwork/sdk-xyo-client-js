import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ModuleConfig } from '@xyo-network/module-model'
import type {
  Payload,
  Schema,
} from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const WitnessConfigSchema = asSchema('network.xyo.witness.config', true)
export type WitnessConfigSchema = typeof WitnessConfigSchema

export type WitnessConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends Schema | void = void> = ModuleConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : WitnessConfigSchema
    },
    TConfig
  >,
  TSchema
>
