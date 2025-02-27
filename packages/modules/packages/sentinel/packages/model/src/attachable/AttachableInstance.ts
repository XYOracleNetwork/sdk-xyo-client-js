import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { AttachableModuleInstance } from '@xyo-network/module-model'

import { SentinelModuleEventData } from '../EventData.ts'
import { SentinelInstance } from '../Instance.ts'
import { SentinelModule } from '../Module.ts'
import { SentinelParams } from '../Params.ts'

export interface AttachableSentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> extends SentinelModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  SentinelInstance<TParams, TEventData> {}

export type AttachableSentinelInstanceTypeCheck<T extends AttachableSentinelInstance = AttachableSentinelInstance> = TypeCheck<T>

export class IsAttachableSentinelInstanceFactory<T extends AttachableSentinelInstance = AttachableSentinelInstance> extends IsObjectFactory<T> {}
