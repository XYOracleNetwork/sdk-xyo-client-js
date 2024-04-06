import { AnyConfigSchema, Module } from '@xyo-network/module-model'

import { DivinerConfig } from './Config'
import { DivinerModuleEventData } from './EventData'

export interface DivinerModule<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> extends Module<TConfig, TEvents> {}
