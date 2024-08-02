import { ModuleInstance } from '@xyo-network/module-model'

import { SentinelModuleEventData } from './EventData.ts'
import { CustomSentinelModule, SentinelModule } from './Module.ts'
import { SentinelParams } from './Params.ts'
import { Sentinel } from './Sentinel.ts'

export interface SentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> extends SentinelModule<TParams, TEventData>,
    Sentinel,
    ModuleInstance<TParams, TEventData> {}

export interface CustomSentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends CustomSentinelModule<TParams, TEvents>,
    Sentinel,
    SentinelInstance<TParams, TEvents> {}
