import { ModuleBusyEventData } from './ModuleBusy.js'
import { ModuleErrorEventData } from './ModuleError.js'
import { ModuleQueriedEventData } from './ModuleQueried.js'

export interface ModuleEventData<TModule extends object = object>
  extends ModuleQueriedEventData<TModule>,
    ModuleBusyEventData<TModule>,
    ModuleErrorEventData<TModule> {}
