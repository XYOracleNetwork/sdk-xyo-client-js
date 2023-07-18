import { EventData } from '@xyo-network/module-events'

import { ModuleEventArgs, ModuleInstance } from '../Module'

export type ModuleBusyEventArgs<TModule extends ModuleInstance = ModuleInstance> = ModuleEventArgs<TModule, { busy: boolean }>

export interface ModuleBusyEventData extends EventData {
  moduleBusy: ModuleBusyEventArgs
}
