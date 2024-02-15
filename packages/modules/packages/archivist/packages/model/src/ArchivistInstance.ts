import { ModuleInstance } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistModule, ArchivistModuleEventData, ArchivistQueryFunctions } from './Archivist'
import { ArchivistParams } from './Params'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
    ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
    ModuleInstance<TParams, TEventData> {}
