import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

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
