import type { ModuleEventData, ModuleInstance } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ObserveEndEventData, ObserveStartEventData } from './EventsModels/index.ts'

export type WitnessModuleEventData<
  T extends ModuleInstance = ModuleInstance,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> = ObserveEndEventData<T, TIn, TOut> & ObserveStartEventData<T, TIn> & ModuleEventData<T>
