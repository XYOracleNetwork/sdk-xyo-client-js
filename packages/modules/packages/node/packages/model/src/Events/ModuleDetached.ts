import { EventData, Module, ModuleEventArgs } from '@xyo-network/module'

export type ModuleDetachedEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleDetachedEventData extends EventData {
  moduleDetached: ModuleDetachedEventArgs
}
