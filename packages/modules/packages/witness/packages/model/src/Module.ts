import { Module } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData.js'
import { WitnessParams } from './Params.js'

export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TEvents extends WitnessModuleEventData = WitnessModuleEventData>
  extends Module<TParams, TEvents> {}
