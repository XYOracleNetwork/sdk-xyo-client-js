import { AnyConfigSchema, ModuleInstance } from '@xyo-network/module-model'

import { SentinelConfig } from './Config'
import { SentinelModuleEventData } from './EventData'
import { CustomSentinelModule, SentinelModule } from './Module'
import { Sentinel } from './Sentinel'

export interface SentinelInstance<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> extends SentinelModule<TConfig, TEventData>,
    Sentinel,
    ModuleInstance<TConfig, TEventData> {}

export interface CustomSentinelInstance<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TEvents extends SentinelModuleEventData<SentinelInstance<TConfig>> = SentinelModuleEventData<SentinelInstance<TConfig>>,
> extends CustomSentinelModule<TConfig, TEvents>,
    Sentinel,
    SentinelInstance<TConfig, TEvents> {}
