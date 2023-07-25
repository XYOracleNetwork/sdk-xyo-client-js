import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { EventData } from '@xyo-network/module-events'
import { Payload } from '@xyo-network/payload-model'

import { Module, ModuleEventArgs } from '../module'
import { ModuleQueryResult } from '../ModuleQueryResult'

export type ModuleQueriedEventArgs<TModule extends Module = Module> = ModuleEventArgs<
  TModule,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result: ModuleQueryResult
  }
>

export interface ModuleQueriedEventData extends EventData {
  moduleQueried: ModuleQueriedEventArgs
}
