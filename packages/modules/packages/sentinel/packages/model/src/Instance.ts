import { ModuleInstance } from '@xyo-network/module-model'

import { SentinelModuleEventData } from './EventData.js'
import { CustomSentinelModule, SentinelModule } from './Module.js'
import { SentinelParams } from './Params.js'
import { Sentinel } from './Sentinel.js'

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
