import type { EventData } from '@xyo-network/module-events'

import type { ModuleEventArgs } from './ModuleEventArgs.ts'

export type ModuleBusyEventArgs<TModule extends object = object> = ModuleEventArgs<
  TModule,
  {
    busy: boolean
  }
>

export interface ModuleBusyEventData<TModule extends object = object> extends EventData {
  moduleBusy: ModuleBusyEventArgs<TModule>
}
