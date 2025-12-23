import type { EventData } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type {
  Module, ModuleEventArgs, ModuleQueryResult,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

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
