import type { EventData } from '@xylabs/events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

export type InsertedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T, {
    inPayloads: Payload[]
    outPayloads: WithStorageMeta<Payload>[]
    payloads: WithStorageMeta<Payload>[]
  }
>

export interface InsertedEventData<T extends Module = Module> extends EventData {
  inserted: InsertedEventArgs<T>
}
