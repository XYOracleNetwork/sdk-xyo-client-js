import { ModuleInstance } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistModuleEventData } from './EventData.ts'
import { ArchivistModule } from './Module.ts'
import { ArchivistParams } from './Params.ts'
import { ArchivistQueryFunctions } from './QueryFunctions.ts'
import { ArchivistRawQueryFunctions } from './RawQueryFunctions.ts'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
  ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
  ModuleInstance<TParams, TEventData>,
  ArchivistRawQueryFunctions {}
