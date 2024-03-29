import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistModule, ArchivistModuleEventData } from '../Archivist'
import { ArchivistInstance } from '../ArchivistInstance'
import { ArchivistParams } from '../Params'

export interface AttachableArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TParams, TEventData>,
    AttachableModuleInstance<TParams, TEventData>,
    ArchivistInstance<TParams, TEventData, TPayload> {}

export type AttachableArchivistInstanceTypeCheck<T extends AttachableArchivistInstance = AttachableArchivistInstance> = TypeCheck<T>

export class IsAttachableArchivistInstanceFactory<T extends AttachableArchivistInstance = AttachableArchivistInstance> extends IsObjectFactory<T> {}
