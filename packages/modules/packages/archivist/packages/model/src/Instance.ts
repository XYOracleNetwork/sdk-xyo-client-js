import { ModuleInstance } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistModuleEventData } from './EventData.js'
import { ArchivistModule } from './Module.js'
import { ArchivistParams } from './Params.js'
import { ArchivistQueryFunctions } from './QueryFunctions.js'
import { ArchivistRawQueryFunctions } from './RawQueryFunctions.js'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
    ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
    ModuleInstance<TParams, TEventData>,
    ArchivistRawQueryFunctions {}
