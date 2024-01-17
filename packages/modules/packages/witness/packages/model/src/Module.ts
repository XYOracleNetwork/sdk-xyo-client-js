import { Module } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { WitnessModuleEventData } from './EventData'
import { WitnessParams } from './Params'

export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends Module<TParams, WitnessModuleEventData<WitnessModule<TParams, TIn, TOut>>> {}
