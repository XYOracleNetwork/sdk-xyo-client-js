import { ModuleConfig } from '@xyo-network/module-model'
import { EmptyObject, WithAdditional } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

export const DivinerConfigSchema = 'network.xyo.diviner.config'
export type DivinerConfigSchema = typeof DivinerConfigSchema

export type DivinerConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : DivinerConfigSchema
    },
    TConfig
  >,
  TSchema
>
