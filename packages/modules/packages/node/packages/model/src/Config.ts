import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ModuleConfig } from '@xyo-network/module-model'
import type {
  Payload,
  Schema,
} from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const NodeConfigSchema = asSchema('network.xyo.node.config', true)
export type NodeConfigSchema = typeof NodeConfigSchema

export type NodeConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends Schema | void = void> = ModuleConfig<
  WithAdditional<
    {
      archivist?: string
    },
    TConfig
  >,
  TSchema extends void
    ? TConfig extends Payload
      ? TConfig['schema']
      : NodeConfigSchema
    : TSchema
>
