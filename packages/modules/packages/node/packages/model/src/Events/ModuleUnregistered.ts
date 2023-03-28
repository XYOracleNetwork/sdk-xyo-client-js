import { EventData, Module, ModuleEventArgs } from '@xyo-network/module'

export type ModuleUnregisteredEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleUnregisteredEventData extends EventData {
  moduleUnregistered: ModuleUnregisteredEventArgs
}
