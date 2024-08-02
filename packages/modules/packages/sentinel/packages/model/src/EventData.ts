import { Module, ModuleEventData } from '@xyo-network/module-model'

import {
  JobEndEventData,
  JobStartEventData,
  ReportEndEventData,
  ReportStartEventData,
  TaskEndEventData,
  TaskStartEventData,
} from './EventsModels/index.ts'

export interface SentinelModuleEventData<T extends Module = Module>
  extends TaskEndEventData<T>,
    TaskStartEventData<T>,
    JobEndEventData<T>,
    JobStartEventData<T>,
    ReportEndEventData<T>,
    ReportStartEventData<T>,
    ModuleEventData<T> {}
