import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData } from '@xyo-network/module-events'
import { Module, ModuleEventArgs, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type QuerySendFinishedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result?: ModuleQueryResult
    status: 'success' | 'failure'
  }
>

export interface QuerySendFinishedEventData<T extends Module = Module> extends EventData {
  querySendFinished: QuerySendFinishedEventArgs<T>
}
