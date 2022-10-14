import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type NodeConfigSchema = 'network.xyo.node.config'
export const NodeConfigSchema: NodeConfigSchema = 'network.xyo.node.config'

export type NodeConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<{ archivist?: string } & TConfig>
