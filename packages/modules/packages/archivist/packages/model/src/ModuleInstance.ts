import type {
  AnyConfigSchema, QueryableModule, QueryableModuleParams,
} from '@xyo-network/module-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistModuleEventData } from './EventData.ts'

export interface ArchivistModuleInstance<
  TParams extends QueryableModuleParams<AnyConfigSchema<ArchivistConfig>> = QueryableModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends QueryableModule<TParams, TEventData> {}
