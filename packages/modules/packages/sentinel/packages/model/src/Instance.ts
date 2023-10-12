import { ModuleInstance } from '@xyo-network/module-model'

import { SentinelModuleEventData } from './EventData'
import { CustomSentinelModule, SentinelModule } from './Module'
import { SentinelParams } from './Params'
import { Sentinel } from './Sentinel'

export type SentinelInstance<TParams extends SentinelParams = SentinelParams> = SentinelModule<TParams> & Sentinel & ModuleInstance<TParams>

export type CustomSentinelInstance<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> = CustomSentinelModule<TParams, TEvents> & Sentinel & SentinelInstance<TParams>
