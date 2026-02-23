import type { ModuleEventData, QueryableModule } from '@xyo-network/module-model'

import type {
  JobEndEventData,
  JobStartEventData,
  ReportEndEventData,
  ReportStartEventData,
  TaskEndEventData,
  TaskStartEventData,
} from './EventsModels/index.ts'

export interface SentinelModuleEventData<T extends QueryableModule = QueryableModule>
  extends TaskEndEventData<T>,
  TaskStartEventData<T>,
  JobEndEventData<T>,
  JobStartEventData<T>,
  ReportEndEventData<T>,
  ReportStartEventData<T>,
  ModuleEventData<T> {}
