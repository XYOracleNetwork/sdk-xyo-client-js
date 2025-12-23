import type { EventData } from '@xylabs/sdk-js'

import type { ModuleEventArgs } from './ModuleEventArgs.ts'

export type ModuleErrorEventArgs<TModule extends object = object> = ModuleEventArgs<
  TModule,
  {
    error: Error
  }
>

export interface ModuleErrorEventData<TModule extends object = object> extends EventData {
  moduleError: ModuleErrorEventArgs<TModule>
}
