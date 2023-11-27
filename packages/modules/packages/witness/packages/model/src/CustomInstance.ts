import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { CustomWitnessModule } from './CustomModule'
import { WitnessModuleEventData } from './EventData'
import { WitnessInstance } from './Instance'
import { WitnessParams } from './Params'
import { Witness } from './Witness'

export type CustomWitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> = CustomWitnessModule<TParams, TIn, TOut, TEvents> & Witness<TIn, TOut> & ModuleInstance
