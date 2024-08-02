import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { CustomWitnessModule } from './CustomModule.ts'
import { WitnessModuleEventData } from './EventData.ts'
import { WitnessInstance } from './Instance.ts'
import { WitnessParams } from './Params.ts'
import { WitnessQueryFunctions } from './QueryFunctions.ts'

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
