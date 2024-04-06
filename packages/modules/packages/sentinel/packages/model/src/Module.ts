import { AnyConfigSchema, Module } from '@xyo-network/module-model'

import { SentinelConfig } from './Config'
import { SentinelModuleEventData } from './EventData'

export interface SentinelModule<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> extends Module<TConfig, TEventData> {}

export interface CustomSentinelModule<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TEvents extends SentinelModuleEventData<SentinelModule<TConfig>> = SentinelModuleEventData<SentinelModule<TConfig>>,
> extends Module<TConfig, TEvents> {}
