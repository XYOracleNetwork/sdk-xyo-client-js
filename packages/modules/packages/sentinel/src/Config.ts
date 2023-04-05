import { ArchivingModuleConfig } from '@xyo-network/archivist'
import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type SentinelConfigSchema = 'network.xyo.node.sentinel'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.node.sentinel'

export type SentinelConfig<TConfig extends Payload = Payload> = ModuleConfig<
  ArchivingModuleConfig & {
    schema: SentinelConfigSchema
    witnesses?: string[]
  } & TConfig
>
