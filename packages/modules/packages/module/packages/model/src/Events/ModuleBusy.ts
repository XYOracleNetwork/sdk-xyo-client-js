import { EventData } from '@xyo-network/module-events'

import { IndirectModule, ModuleEventArgs } from '../Module'

export type ModuleBusyEventArgs<TModule extends IndirectModule = IndirectModule> = ModuleEventArgs<TModule, { busy: boolean }>

export interface ModuleBusyEventData extends EventData {
  moduleBusy: ModuleBusyEventArgs
}
