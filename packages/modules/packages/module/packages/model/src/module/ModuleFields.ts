import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { ModuleConfig } from '../Config'
import { ModuleParams } from '../ModuleParams'
import { ModuleQueryResult } from '../ModuleQueryResult'

export type ModuleFields<TParams extends ModuleParams = ModuleParams> = {
  address: string
  config: TParams['config']

  params: TParams

  previousHash: () => Promisable<string | undefined>

  queries: string[]
  query: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<boolean>

  start?: () => Promisable<boolean>
  stop?: () => Promisable<boolean>
}
