import { ModuleBusyEventData } from './ModuleBusy.ts'
import { ModuleErrorEventData } from './ModuleError.ts'
import { ModuleQueriedEventData } from './ModuleQueried.ts'

export interface ModuleEventData<TModule extends object = object>
  extends ModuleQueriedEventData<TModule>,
    ModuleBusyEventData<TModule>,
    ModuleErrorEventData<TModule> {}
