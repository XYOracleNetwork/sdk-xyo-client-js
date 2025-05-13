import type { EventData } from '@xylabs/events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ModuleDetachedEventArgs<TModule extends Module = Module> = ModuleEventArgs<TModule>

export interface ModuleDetachedEventData extends EventData {
  moduleDetached: ModuleDetachedEventArgs
}
