import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ModuleRegisteredEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleRegisteredEventData extends EventData {
  moduleRegistered: ModuleRegisteredEventArgs
}
