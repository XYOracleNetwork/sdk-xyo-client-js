import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { EventData } from '@xyo-network/module-events'
import type { Payload } from '@xyo-network/payload-model'

import type { ModuleQueryResult } from '../ModuleQueryResult.ts'
import type { ModuleEventArgs } from './ModuleEventArgs.ts'

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
