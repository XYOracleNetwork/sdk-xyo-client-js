import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload, WithMeta } from '@xyo-network/payload-model'

export type InsertedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads: WithMeta<Payload>[]
  }
>

export interface InsertedEventData<T extends Module = Module> extends EventData {
  inserted: InsertedEventArgs<T>
}
