import { ModuleInstance } from '@xyo-network/module-model'

import { SentinelModuleEventData } from './EventData'
import { CustomSentinelModule, SentinelModule } from './Module'
import { SentinelParams } from './Params'
import { Sentinel } from './Sentinel'

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
