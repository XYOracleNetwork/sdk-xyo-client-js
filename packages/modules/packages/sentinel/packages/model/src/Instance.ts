import type { ModuleInstance } from '@xyo-network/module-model'

import type { SentinelModuleEventData } from './EventData.ts'
import type { CustomSentinelModule, SentinelModule } from './Module.ts'
import type { SentinelParams } from './Params.ts'
import type { Sentinel } from './Sentinel.ts'

export type SentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> = SentinelModule<TParams, TEventData> &
  Sentinel &
  ModuleInstance<TParams, TEventData>

export type CustomSentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> = CustomSentinelModule<TParams, TEvents> &
  Sentinel &
  SentinelInstance<TParams, TEvents>
