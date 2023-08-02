import { Module, ModuleEventData } from '@xyo-network/module-model'

import { DivineEndEventData, DivineStartEventData } from './Events'

export interface DivinerModuleEventData<T extends Module = Module> extends DivineEndEventData<T>, DivineStartEventData<T>, ModuleEventData<T> {}