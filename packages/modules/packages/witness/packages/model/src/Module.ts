import { Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData'
import { WitnessInstance } from './Instance'
import { WitnessParams } from './Params'

export type WitnessModule<TParams extends WitnessParams = WitnessParams, TIn extends Payload = Payload, TOut extends Payload = Payload> = Module<
  TParams,
  WitnessModuleEventData<WitnessModule, TIn, TOut>
>

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
