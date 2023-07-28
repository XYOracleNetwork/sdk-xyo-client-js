import { Module } from '@xyo-network/module-model'

import { SentinelModuleEventData } from './EventData'
import { SentinelParams } from './Params'

export type SentinelModule<TParams extends SentinelParams = SentinelParams> = Module<TParams, SentinelModuleEventData<SentinelModule>>

export type CustomSentinelModule<
  TParams extends SentinelParams = SentinelParams,
  TEvents extends SentinelModuleEventData<SentinelModule<TParams>> = SentinelModuleEventData<SentinelModule<TParams>>,
> = Module<TParams, TEvents>
