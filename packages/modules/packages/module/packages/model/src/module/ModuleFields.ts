import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { ModuleConfig } from '../Config'
import { ModuleName } from '../ModuleIdentifier'
import { ModuleParams } from '../ModuleParams'
import { ModuleQueryResult } from '../ModuleQueryResult'

export interface ModuleFields<TParams extends ModuleParams = ModuleParams> {
  address: Address
  config: TParams['config']

  /** The name (if specified) or address of the module */
  id: string

  modName?: ModuleName

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
