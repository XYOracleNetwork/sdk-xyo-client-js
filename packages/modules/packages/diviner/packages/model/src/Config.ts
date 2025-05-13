import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { ModuleConfig, ModuleIdentifier } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

export const DivinerConfigSchema = 'network.xyo.diviner.config' as const
export type DivinerConfigSchema = typeof DivinerConfigSchema

export interface ModuleEventSubscription {
  sourceEvent: string
  sourceModule: ModuleIdentifier
  targetModuleFunction?: string
}

export type DivinerConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends Schema | void = void> = ModuleConfig<
  WithAdditional<
    {
      eventSubscriptions?: ModuleEventSubscription[]
      schema: TConfig extends Payload ? TConfig['schema'] : DivinerConfigSchema
    },
    TConfig
  >,
  TSchema
>
