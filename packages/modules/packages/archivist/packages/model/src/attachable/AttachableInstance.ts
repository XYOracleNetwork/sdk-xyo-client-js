import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { AttachableModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ArchivistModuleEventData } from '../EventData.ts'
import type { ArchivistInstance } from '../Instance.ts'
import type { ArchivistModule } from '../Module.ts'
import type { ArchivistParams } from '../Params.ts'

export interface AttachableArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  ArchivistInstance<TParams, TEventData, TPayload> {}

export type AttachableArchivistInstanceTypeCheck<T extends AttachableArchivistInstance = AttachableArchivistInstance> = TypeCheck<T>

export class IsAttachableArchivistInstanceFactory<T extends AttachableArchivistInstance = AttachableArchivistInstance> extends IsObjectFactory<T> {}
