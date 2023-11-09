import { Module, ModuleEventData } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { DivineEndEventData, DivineStartEventData } from './EventsModels'

export interface DivinerModuleEventData<T extends Module = Module, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends DivineEndEventData<T, TIn, TOut>,
    DivineStartEventData<T, TIn>,
    ModuleEventData<T> {}
