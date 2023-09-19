import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ObserveEndEventData, ObserveStartEventData } from './EventsModels'

export interface WitnessModuleEventData<T extends Module = Module> extends ObserveEndEventData<T>, ObserveStartEventData<T>, ModuleEventData<T> {}
