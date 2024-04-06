import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AnyConfigSchema, AttachableModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistModule, ArchivistModuleEventData } from '../Archivist'
import { ArchivistInstance } from '../ArchivistInstance'
import { ArchivistConfig } from '../Config'

export interface AttachableArchivistInstance<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModule<TConfig, TEventData>,
    AttachableModuleInstance<TConfig, TEventData>,
    ArchivistInstance<TConfig, TEventData, TPayload> {}

export type AttachableArchivistInstanceTypeCheck<T extends AttachableArchivistInstance = AttachableArchivistInstance> = TypeCheck<T>

export class IsAttachableArchivistInstanceFactory<T extends AttachableArchivistInstance = AttachableArchivistInstance> extends IsObjectFactory<T> {}
