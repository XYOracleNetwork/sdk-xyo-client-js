import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleParams } from '../ModuleParams'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { ModuleResolver } from './ModuleResolver'

export type ModuleFields<TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>> = {
  address: string
  config: TParams['config']

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: Omit<ModuleResolver, 'resolve'>

  loadAccount?: () => Promisable<AccountInstance>

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

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: Omit<ModuleResolver, 'resolve'>
}
