import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData'
import { WitnessModule } from './Module'
import { WitnessParams } from './Params'
import { WitnessQueryFunctions } from './QueryFunctions'

export interface WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessModule<TParams, TEvents>,
    WitnessQueryFunctions<TIn, TOut>,
    ModuleInstance<TParams, TEvents> {}
