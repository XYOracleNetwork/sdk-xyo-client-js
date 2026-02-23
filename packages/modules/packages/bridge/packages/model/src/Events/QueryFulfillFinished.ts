import type { EventData } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type {
  ModuleEventArgs, ModuleQueryResult,
  QueryableModule,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QueryFulfillFinishedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result?: ModuleQueryResult
    status: 'success' | 'failure'
  }
>

export interface QueryFulfillFinishedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  queryFulfillFinished: QueryFulfillFinishedEventArgs<T>
}
