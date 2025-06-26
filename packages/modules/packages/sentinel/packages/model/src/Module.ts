import type { Module } from '@xyo-network/module-model'

import type { SentinelModuleEventData } from './EventData.ts'
import type { SentinelParams } from './Params.ts'

export type SentinelModule<TParams extends SentinelParams = SentinelParams, TEventData extends SentinelModuleEventData = SentinelModuleEventData>
  = Module<TParams, TEventData>

export type CustomSentinelModule<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelModule<TParams>> = SentinelModuleEventData<SentinelModule<TParams>>,
> = Module<TParams, TEvents>
