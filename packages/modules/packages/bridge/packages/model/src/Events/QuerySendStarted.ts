import type { EventData } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleEventArgs, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export type QuerySendStartedEventArgs<T extends QueryableModule = QueryableModule> = ModuleEventArgs<
  T,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
  }
>

export interface QuerySendStartedEventData<T extends QueryableModule = QueryableModule> extends EventData {
  querySendStarted: QuerySendStartedEventArgs<T>
}
