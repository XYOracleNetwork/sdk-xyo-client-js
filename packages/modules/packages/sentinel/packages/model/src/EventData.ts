import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ReportEndEventData, ReportStartEventData } from './EventsModels'

export interface SentinelModuleEventData<T extends Module = Module> extends ReportEndEventData<T>, ReportStartEventData<T>, ModuleEventData<T> {}
