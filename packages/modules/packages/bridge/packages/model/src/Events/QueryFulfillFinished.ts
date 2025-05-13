import type { EventData } from '@xylabs/events'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type {
  Module, ModuleEventArgs, ModuleQueryResult,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QueryFulfillFinishedEventArgs<T extends Module = Module> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result?: ModuleQueryResult
    status: 'success' | 'failure'
  }
>

export interface QueryFulfillFinishedEventData<T extends Module = Module> extends EventData {
  queryFulfillFinished: QueryFulfillFinishedEventArgs<T>
}
