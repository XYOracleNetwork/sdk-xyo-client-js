import { Module } from '@xyo-network/module-model'

import { WitnessModuleEventData } from './EventData.ts'
import { WitnessParams } from './Params.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WitnessModule<TParams extends WitnessParams = WitnessParams, TEvents extends WitnessModuleEventData = WitnessModuleEventData>
  extends Module<TParams, TEvents> {}
