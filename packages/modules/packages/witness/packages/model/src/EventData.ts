import { ModuleEventData, ModuleInstance } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ObserveEndEventData, ObserveStartEventData } from './EventsModels/index.js'

export type WitnessModuleEventData<
  T extends ModuleInstance = ModuleInstance,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = ObserveEndEventData<T, TIn, TOut> & ObserveStartEventData<T, TIn> & ModuleEventData<T>
