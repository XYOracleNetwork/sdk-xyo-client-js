import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData.ts'
import { WitnessModule } from './Module.ts'
import { WitnessParams } from './Params.ts'
import { WitnessQueryFunctions } from './QueryFunctions.ts'

export interface WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> extends WitnessModule<TParams, TEvents>,
  WitnessQueryFunctions<TIn, TOut>,
  ModuleInstance<TParams, TEvents> {}
