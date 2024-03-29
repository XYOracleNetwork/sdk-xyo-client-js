import { Module } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData'
import { WitnessParams } from './Params'

export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TEvents extends WitnessModuleEventData = WitnessModuleEventData>
  extends Module<TParams, TEvents> {}
