import type { TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import type { AttachableModuleInstance } from '@xyo-network/module-model'

import type { SentinelModuleEventData } from '../EventData.ts'
import type { SentinelInstance } from '../Instance.ts'
import type { SentinelModule } from '../Module.ts'
import type { SentinelParams } from '../Params.ts'

export interface AttachableSentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> extends SentinelModule<TParams, TEventData>,
  AttachableModuleInstance<TParams, TEventData>,
  SentinelInstance<TParams, TEventData> {}

export type AttachableSentinelInstanceTypeCheck<T extends AttachableSentinelInstance = AttachableSentinelInstance> = TypeCheck<T>

export class IsAttachableSentinelInstanceFactory<T extends AttachableSentinelInstance = AttachableSentinelInstance> extends IsObjectFactory<T> {}
