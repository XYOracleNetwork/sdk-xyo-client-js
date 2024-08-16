import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { ModuleConfig } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export const NodeConfigSchema = 'network.xyo.node.config' as const
export type NodeConfigSchema = typeof NodeConfigSchema

export type NodeConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      archivist?: string
    },
    TConfig
  >,
  TSchema extends void ?
    TConfig extends Payload ?
      TConfig['schema']
      : NodeConfigSchema
    : TSchema
>
