import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'

export type ClearedEventArgs<T extends Module = Module> = ModuleEventArgs<T>

export interface ClearedEventData<T extends Module = Module> extends EventData {
  cleared: ClearedEventArgs<T>
}
