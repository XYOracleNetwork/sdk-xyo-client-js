import type { EventData } from '@xylabs/sdk-js'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ModuleUnregisteredEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleUnregisteredEventData extends EventData {
  moduleUnregistered: ModuleUnregisteredEventArgs
}
