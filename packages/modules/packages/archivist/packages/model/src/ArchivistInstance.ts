import { ModuleInstance } from '@xyo-network/module-model'

import { ArchivistModule, ArchivistModuleEventData, ArchivistQueryFunctions } from './Archivist'
import { ArchivistParams } from './Params'

export type ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = ArchivistModule<TParams, TEventData> & ArchivistQueryFunctions & ModuleInstance<TParams, TEventData>
