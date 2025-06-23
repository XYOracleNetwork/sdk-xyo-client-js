import type { ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { WitnessModuleEventData } from './EventData.ts'
import type { WitnessModule } from './Module.ts'
import type { WitnessParams } from './Params.ts'
import type { WitnessQueryFunctions } from './QueryFunctions.ts'

export type WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData = WitnessModuleEventData,
> = WitnessModule<TParams, TEvents> &
  WitnessQueryFunctions<TIn, TOut> &
  ModuleInstance<TParams, TEvents>
