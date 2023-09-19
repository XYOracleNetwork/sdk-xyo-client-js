import { ModuleBusyEventData } from './ModuleBusy'
import { ModuleErrorEventData } from './ModuleError'
import { ModuleQueriedEventData } from './ModuleQueried'

export interface ModuleEventData<TModule extends object = object>
  extends ModuleQueriedEventData<TModule>,
    ModuleBusyEventData<TModule>,
    ModuleErrorEventData<TModule> {}
