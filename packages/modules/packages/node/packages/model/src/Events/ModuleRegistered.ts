import { EventData, Module, ModuleEventArgs } from '@xyo-network/module'

export type ModuleRegisteredEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleRegisteredEventData extends EventData {
  moduleRegistered: ModuleRegisteredEventArgs
}
