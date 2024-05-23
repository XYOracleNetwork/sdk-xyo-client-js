import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

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
