import type { ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { CustomWitnessModule } from './CustomModule.ts'
import type { WitnessModuleEventData } from './EventData.ts'
import type { WitnessInstance } from './Instance.ts'
import type { WitnessParams } from './Params.ts'
import type { WitnessQueryFunctions } from './QueryFunctions.ts'

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
