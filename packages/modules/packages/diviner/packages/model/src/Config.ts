import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ModuleConfig, ModuleIdentifier } from '@xyo-network/module-model'
import {
  asSchema, type Payload, type Schema,
} from '@xyo-network/payload-model'

export const DivinerConfigSchema = asSchema('network.xyo.diviner.config', true)
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
    },
    Omit<TConfig, 'schema'>
  >,
  TSchema extends Schema ? TSchema : TConfig extends Payload ? TConfig['schema'] : DivinerConfigSchema
>
