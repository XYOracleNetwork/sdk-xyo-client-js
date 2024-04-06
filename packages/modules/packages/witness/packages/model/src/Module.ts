import { AnyConfigSchema, Module } from '@xyo-network/module-model'

import { WitnessConfig } from './Config'
import { WitnessModuleEventData } from './EventData'

export interface WitnessModule<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> extends Module<TConfig, TEvents> {}
