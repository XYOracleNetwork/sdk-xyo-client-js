import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ModuleAttachedEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleAttachedEventData extends EventData {
  moduleAttached: ModuleAttachedEventArgs
}
