import type {
  AnyConfigSchema, Module, ModuleParams,
} from '@xyo-network/module-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistModuleEventData } from './EventData.ts'

export type ArchivistModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = Module<TParams, TEventData>
