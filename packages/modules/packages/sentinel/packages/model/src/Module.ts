import type { Module } from '@xyo-network/module-model'

import type { SentinelModuleEventData } from './EventData.ts'
import type { SentinelParams } from './Params.ts'

export interface SentinelModule<TParams extends SentinelParams = SentinelParams, TEventData extends SentinelModuleEventData = SentinelModuleEventData>
  extends Module<TParams, TEventData> {}

export interface CustomSentinelModule<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelModule<TParams>> = SentinelModuleEventData<SentinelModule<TParams>>,
> extends Module<TParams, TEvents> {}
