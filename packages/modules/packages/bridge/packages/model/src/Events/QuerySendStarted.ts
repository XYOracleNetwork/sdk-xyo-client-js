import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { EventData } from '@xyo-network/module-events'
import type { Module, ModuleEventArgs } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QuerySendStartedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
  }
>

export interface QuerySendStartedEventData<T extends Module = Module> extends EventData {
  querySendStarted: QuerySendStartedEventArgs<T>
}
