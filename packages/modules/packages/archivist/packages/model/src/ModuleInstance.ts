import type {
  AnyConfigSchema, Module, ModuleParams,
} from '@xyo-network/module-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistModuleEventData } from './EventData.ts'

export interface ArchivistModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends Module<TParams, TEventData> {}
