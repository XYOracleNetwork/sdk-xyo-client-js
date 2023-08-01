import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ReportEndEventData, ReportStartEventData } from './Events'

export interface SentinelModuleEventData<T extends Module = Module> extends ReportEndEventData<T>, ReportStartEventData<T>, ModuleEventData<T> {}
