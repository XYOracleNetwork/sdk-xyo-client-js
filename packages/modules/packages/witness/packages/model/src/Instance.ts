import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData.js'
import { WitnessModule } from './Module.js'
import { WitnessParams } from './Params.js'
import { WitnessQueryFunctions } from './QueryFunctions.js'

export interface WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessModule<TParams, TEvents>,
    WitnessQueryFunctions<TIn, TOut>,
    ModuleInstance<TParams, TEvents> {}
