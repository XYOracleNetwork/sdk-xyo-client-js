import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { ModuleDescription } from './ModuleDescription'
import { ModuleFilter } from './ModuleFilter'
import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoQueryBoundWitness } from './Query'

export interface ModuleResolver {
  isModuleResolver: boolean
  resolve(filter?: ModuleFilter): Promisable<Module[]>
}

export interface Module<TConfig extends XyoPayload = XyoPayload> {
  address: string
  config: TConfig
  description: () => Promisable<ModuleDescription>
  queries: () => string[]
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) => Promisable<ModuleQueryResult>
  queryable: (schema: string, addresses?: string[]) => boolean
  resolver?: ModuleResolver
}
