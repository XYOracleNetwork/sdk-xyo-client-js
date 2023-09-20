import { EventData } from '@xyo-network/module-events'

import { ModuleEventArgs } from './ModuleEventArgs'

export type ModuleBusyEventArgs<TModule extends object = object> = ModuleEventArgs<
  TModule,
  {
    busy: boolean
  }
>

export interface ModuleBusyEventData<TModule extends object = object> extends EventData {
  moduleBusy: ModuleBusyEventArgs<TModule>
}
