import { ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData'
import { CustomWitnessModule, WitnessModule } from './Module'
import { WitnessParams } from './Params'
import { Witness } from './Witness'

export type WitnessInstance<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = WitnessModule<TParams> & Witness<TIn, TOut> & ModuleInstance

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
