import type { Module } from '@xyo-network/module-model'

import type { WitnessModuleEventData } from './EventData.ts'
import type { WitnessParams } from './Params.ts'

export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TEvents extends WitnessModuleEventData = WitnessModuleEventData>
  extends Module<TParams, TEvents> {}
