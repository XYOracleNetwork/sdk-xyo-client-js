import type { ModuleBusyEventData } from './ModuleBusy.ts'
import type { ModuleErrorEventData } from './ModuleError.ts'
import type { ModuleQueriedEventData } from './ModuleQueried.ts'

export interface ModuleEventData<TModule extends object = object>
  extends ModuleQueriedEventData<TModule>,
  ModuleBusyEventData<TModule>,
  ModuleErrorEventData<TModule> {}
