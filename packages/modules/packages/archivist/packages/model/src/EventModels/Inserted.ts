import type { EventData } from '@xylabs/sdk-js'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

export type InsertedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T, {
    inPayloads: Payload[]
    outPayloads: WithStorageMeta<Payload>[]
    payloads: WithStorageMeta<Payload>[]
  }
>

export interface InsertedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  inserted: InsertedEventArgs<T>
}
