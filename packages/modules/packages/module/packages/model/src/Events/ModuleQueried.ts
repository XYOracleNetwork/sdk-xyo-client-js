import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { EventData } from '@xyo-network/module-events'
import { Payload } from '@xyo-network/payload-model'

import { ModuleQueryResult } from '../ModuleQueryResult'
import { ModuleEventArgs } from './ModuleEventArgs'

export type ModuleQueriedEventArgs<TModule extends object = object> = ModuleEventArgs<
  TModule,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result: ModuleQueryResult
  }
>

export interface ModuleQueriedEventData<TModule extends object = object> extends EventData {
  moduleQueried: ModuleQueriedEventArgs<TModule>
}
