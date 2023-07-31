import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ObserveEndEventData, ObserveStartEventData } from './Events'

export interface WitnessModuleEventData<T extends Module = Module> extends ObserveEndEventData<T>, ObserveStartEventData<T>, ModuleEventData<T> {}
