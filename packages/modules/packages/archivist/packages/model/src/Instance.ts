import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistModuleEventData } from './EventData.ts'
import { ArchivistModule } from './Module.ts'
import { ArchivistModuleInstance } from './ModuleInstance.ts'
import { ArchivistParams } from './Params.ts'
import { ArchivistRawQueryFunctions } from './RawQueryFunctions.ts'

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModuleInstance<TParams, TEventData>,
  ArchivistModule<TPayload, TPayload>,
  ModuleInstance<TParams, TEventData>,
  ArchivistRawQueryFunctions {}
