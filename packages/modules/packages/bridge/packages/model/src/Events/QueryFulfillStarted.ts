import type { EventData } from '@xylabs/events'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QueryFulfillStartedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
  }
>

export interface QueryFulfillStartedEventData<T extends Module = Module> extends EventData {
  queryFulfillStarted: QueryFulfillStartedEventArgs<T>
}
