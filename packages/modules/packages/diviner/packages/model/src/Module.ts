import { Module } from '@xyo-network/module-model'

import { DivinerModuleEventData } from './EventData'
import { DivinerParams } from './Params'

export type DivinerModule<TParams extends DivinerParams = DivinerParams> = Module<TParams, DivinerModuleEventData<DivinerModule>>

export type CustomDivinerModule<
  TParams extends DivinerParams = DivinerParams,
  TEvents extends DivinerModuleEventData<DivinerModule<TParams>> = DivinerModuleEventData<DivinerModule<TParams>>,
> = Module<TParams, TEvents>
