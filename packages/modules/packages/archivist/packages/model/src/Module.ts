import { AnyConfigSchema, Module, ModuleParams } from '@xyo-network/module-model'

import { ArchivistConfig } from './Config.ts'
import { ArchivistModuleEventData } from './EventData.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ArchivistModule<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends Module<TParams, TEventData> {}
