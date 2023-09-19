import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ModuleRegisteredEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleRegisteredEventData extends EventData {
  moduleRegistered: ModuleRegisteredEventArgs
}
