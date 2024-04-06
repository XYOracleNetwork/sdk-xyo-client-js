import { AnyConfigSchema, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessConfig } from './Config'
import { WitnessModuleEventData } from './EventData'
import { WitnessModule } from './Module'
import { WitnessQueryFunctions } from './QueryFunctions'

export interface WitnessInstance<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessModule<TConfig, TEvents>,
    WitnessQueryFunctions<TIn, TOut>,
    ModuleInstance<TConfig, TEvents> {}
