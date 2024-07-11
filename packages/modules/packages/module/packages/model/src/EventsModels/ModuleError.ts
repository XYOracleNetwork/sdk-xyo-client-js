import { EventData } from '@xyo-network/module-events'

import { ModuleEventArgs } from './ModuleEventArgs.js'

export type ModuleErrorEventArgs<TModule extends object = object> = ModuleEventArgs<
  TModule,
  {
    error: Error
  }
>

export interface ModuleErrorEventData<TModule extends object = object> extends EventData {
  moduleError: ModuleErrorEventArgs<TModule>
}
