import { Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData.ts'
import { WitnessInstance } from './Instance.ts'
import { WitnessParams } from './Params.ts'

export type CustomWitnessModule<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> = Module<TParams, TEvents>
