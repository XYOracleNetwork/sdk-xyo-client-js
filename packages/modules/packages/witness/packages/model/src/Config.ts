import { ModuleConfig } from '@xyo-network/module-model'
import { EmptyObject, WithAdditional } from '@xyo-network/object'
import { Payload, PayloadSetPayload } from '@xyo-network/payload-model'

export type WitnessConfigSchema = 'network.xyo.witness.config'
export const WitnessConfigSchema: WitnessConfigSchema = 'network.xyo.witness.config'

export type WitnessConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      archivist?: string
      schema: TSchema extends void ? (TConfig extends Payload ? TConfig['schema'] : WitnessConfigSchema) : TSchema
      targetSet?: PayloadSetPayload
    },
    TConfig
  >
>
