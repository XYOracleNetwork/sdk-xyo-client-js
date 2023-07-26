import { Module } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData'
import { WitnessParams } from './Params'

export type WitnessModule<TParams extends WitnessParams = WitnessParams> = Module<TParams, WitnessModuleEventData<WitnessModule>>

export type CustomWitnessModule<
  TParams extends WitnessParams = WitnessParams,
  TEvents extends WitnessModuleEventData<WitnessModule<TParams>> = WitnessModuleEventData<WitnessModule<TParams>>,
> = Module<TParams, TEvents>
