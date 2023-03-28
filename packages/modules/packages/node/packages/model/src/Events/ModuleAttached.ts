import { EventData, Module, ModuleEventArgs } from '@xyo-network/module'

export type ModuleAttachedEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleAttachedEventData extends EventData {
  moduleAttached: ModuleAttachedEventArgs
}
