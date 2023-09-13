import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type NodeConfigSchema = 'network.xyo.node.config'
export const NodeConfigSchema: NodeConfigSchema = 'network.xyo.node.config'

export type NodeConfig<TConfig extends Payload | void = void> = ModuleConfig<
  TConfig,
  {
    archivist?: string
  },
  TConfig extends Payload ? TConfig['schema'] : NodeConfigSchema
>
