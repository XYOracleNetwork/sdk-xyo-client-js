import { Module, ModuleEventData } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ObserveEndEventData, ObserveStartEventData } from './EventsModels'

export interface WitnessModuleEventData<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends ObserveEndEventData<T, TIn, TOut>,
    ObserveStartEventData<T, TIn>,
    ModuleEventData<T> {}
