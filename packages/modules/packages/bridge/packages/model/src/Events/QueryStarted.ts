import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type QueryStartedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
  }
>

export interface QueryStartedEventData<T extends Module = Module> extends EventData {
  queryStarted: QueryStartedEventArgs<T>
}
