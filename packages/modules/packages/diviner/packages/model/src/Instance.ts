import { AnyConfigSchema, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerConfig } from './Config'
import { DivinerQueryFunctions } from './DivinerQueryFunctions'
import { DivinerModuleEventData } from './EventData'
import { DivinerModule } from './Module'

export interface DivinerInstance<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData = DivinerModuleEventData,
> extends DivinerModule<TConfig, TEvents>,
    DivinerQueryFunctions<TIn, TOut>,
    ModuleInstance<TConfig, TEvents> {}
