import type { EventData } from '@xylabs/sdk-js'

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
