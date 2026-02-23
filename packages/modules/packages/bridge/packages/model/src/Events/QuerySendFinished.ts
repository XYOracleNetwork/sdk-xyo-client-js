import type { EventData } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type {
  ModuleEventArgs, ModuleQueryResult,
  QueryableModule,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QuerySendFinishedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result?: ModuleQueryResult
    status: 'success' | 'failure'
  }
>

export interface QuerySendFinishedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  querySendFinished: QuerySendFinishedEventArgs<T>
}
