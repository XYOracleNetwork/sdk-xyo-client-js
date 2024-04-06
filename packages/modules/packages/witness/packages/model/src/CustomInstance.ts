import { AnyConfigSchema, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessConfig } from './Config'
import { CustomWitnessModule } from './CustomModule'
import { WitnessModuleEventData } from './EventData'
import { WitnessInstance } from './Instance'
import { WitnessQueryFunctions } from './QueryFunctions'

export type CustomWitnessInstance<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData<WitnessInstance<TConfig, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TConfig, TIn, TOut>,
    TIn,
    TOut
  >,
> = CustomWitnessModule<TConfig, TIn, TOut, TEvents> & WitnessQueryFunctions<TIn, TOut> & ModuleInstance
