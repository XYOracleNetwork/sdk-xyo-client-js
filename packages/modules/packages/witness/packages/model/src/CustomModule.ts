import type { Module } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { WitnessModuleEventData } from './EventData.ts'
import type { WitnessInstance } from './Instance.ts'
import type { WitnessParams } from './Params.ts'

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
