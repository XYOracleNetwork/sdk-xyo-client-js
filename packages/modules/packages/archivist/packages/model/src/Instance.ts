import { ModuleInstance } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistModuleEventData } from './EventData'
import { ArchivistModule } from './Module'
import { ArchivistParams } from './Params'
import { ArchivistQueryFunctions } from './QueryFunctions'
import { ArchivistRawQueryFunctions } from './RawQueryFunctions'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
    ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
    ModuleInstance<TParams, TEventData>,
    ArchivistRawQueryFunctions {}
