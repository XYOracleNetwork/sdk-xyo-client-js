import { EventData } from '@xyo-network/module-events'

import { Module, ModuleEventArgs } from '../module-fix'

export type ModuleBusyEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule, { busy: boolean }>

export interface ModuleBusyEventData extends EventData {
  moduleBusy: ModuleBusyEventArgs
}
