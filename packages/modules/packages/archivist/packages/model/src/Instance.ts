import type { ModuleInstance } from '@xyo-network/module-model'
import type { Payload, WithMeta } from '@xyo-network/payload-model'

import type { ArchivistModuleEventData } from './EventData.ts'
import type { ArchivistModule } from './Module.ts'
import type { ArchivistParams } from './Params.ts'
import type { ArchivistQueryFunctions } from './QueryFunctions.ts'
import type { ArchivistRawQueryFunctions } from './RawQueryFunctions.ts'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
  ArchivistQueryFunctions<TPayload, WithMeta<TPayload>>,
  ModuleInstance<TParams, TEventData>,
  ArchivistRawQueryFunctions {}
