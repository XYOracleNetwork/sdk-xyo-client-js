import { WithAdditional } from '@xylabs/object'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export const NodeConfigSchema = 'network.xyo.node.config'
export type NodeConfigSchema = typeof NodeConfigSchema

export type NodeConfig<TConfig extends Payload | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      archivist?: string
      schema: TConfig extends Payload ? TConfig['schema'] : NodeConfigSchema
    },
    TConfig
  >,
  TSchema
>
