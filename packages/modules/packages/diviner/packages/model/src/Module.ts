import { Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivinerModuleEventData } from './EventData'
import { DivinerParams } from './Params'

export type DivinerModule<TParams extends DivinerParams = DivinerParams, TIn extends Payload = Payload, TOut extends Payload = Payload> = Module<
  TParams,
  DivinerModuleEventData<DivinerModule<TParams, TIn, TOut>>
>

export type CustomDivinerModule<
  TParams extends DivinerParams = DivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEvents extends DivinerModuleEventData<DivinerModule<TParams, TIn, TOut>> = DivinerModuleEventData<DivinerModule<TParams, TIn, TOut>>,
> = Module<TParams, TEvents>
