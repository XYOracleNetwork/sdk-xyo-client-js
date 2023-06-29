import { ArchivingModuleConfig } from '@xyo-network/archivist'
import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type SentinelConfigSchema = 'network.xyo.sentinel.config'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.sentinel.config'

export type SentinelConfig<TConfig extends Payload = Payload> = ModuleConfig<
  ArchivingModuleConfig & {
    schema: SentinelConfigSchema
    witnesses?: string[]
  } & TConfig
>
