import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { CustomWitnessModule } from './CustomModule.js'
import { WitnessModuleEventData } from './EventData.js'
import { WitnessInstance } from './Instance.js'
import { WitnessParams } from './Params.js'
import { WitnessQueryFunctions } from './QueryFunctions.js'

export type CustomWitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> = CustomWitnessModule<TParams, TIn, TOut, TEvents> & WitnessQueryFunctions<TIn, TOut> & ModuleInstance
