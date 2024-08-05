import { Module } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData.ts'
import { WitnessParams } from './Params.ts'

export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TEvents extends WitnessModuleEventData = WitnessModuleEventData>
  extends Module<TParams, TEvents> {}
