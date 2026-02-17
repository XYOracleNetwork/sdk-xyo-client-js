import type { Address, Promisable } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ModuleConfig } from '../Config/index.ts'
import type { ModuleName } from '../ModuleIdentifier.ts'
import type { ModuleQueryResult } from '../ModuleQueryResult.ts'
import type { QueryableModuleParams } from './QueryableModuleParams.ts'

export interface QueryableModuleFields<TParams extends QueryableModuleParams = QueryableModuleParams> {
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
}

/** @deprecated use QueryableModuleFields instead */
export interface ModuleFields<TParams extends QueryableModuleParams = QueryableModuleParams> extends QueryableModuleFields<TParams> {}
