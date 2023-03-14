import { ModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type NodeConfigSchema = 'network.xyo.node.config'
export const NodeConfigSchema: NodeConfigSchema = 'network.xyo.node.config'

export type NodeConfig<TConfig extends XyoPayload | undefined = undefined> = ModuleConfig<
  {
    archivist?: string
    schema: TConfig extends XyoPayload ? TConfig['schema'] : NodeConfigSchema
  } & Omit<TConfig, 'schema'>
>
