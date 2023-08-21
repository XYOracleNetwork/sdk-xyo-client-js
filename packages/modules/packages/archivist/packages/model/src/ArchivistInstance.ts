import { AnyConfigSchema, ModuleInstance, ModuleParams } from '@xyo-network/module-model'

import { ArchivistModule, ArchivistModuleEventData, ArchivistQueryFunctions } from './Archivist'
import { ArchivistConfig } from './Config'

export type ArchivistInstance<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = ArchivistModule<TParams, TEventData> & ArchivistQueryFunctions & ModuleInstance<TParams, TEventData>
