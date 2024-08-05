import { AnyConfigSchema, Module, ModuleParams } from '@xyo-network/module-model'

import { ArchivistConfig } from './Config.ts'
import { ArchivistModuleEventData } from './EventData.ts'

export interface ArchivistModule<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends Module<TParams, TEventData> {}
