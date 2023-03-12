import { ArchivingModuleConfig } from '@xyo-network/archivist'
import { ModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type SentinelConfigSchema = 'network.xyo.node.sentinel'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.node.sentinel'

export type SentinelConfig<TConfig extends XyoPayload = XyoPayload> = ModuleConfig<
  ArchivingModuleConfig & {
    schema: SentinelConfigSchema
    witnesses?: string[]
  } & TConfig
>
