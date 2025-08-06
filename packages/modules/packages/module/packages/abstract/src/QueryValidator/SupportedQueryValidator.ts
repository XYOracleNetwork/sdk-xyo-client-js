import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { Module, ModuleQueries } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { Queryable, QueryValidator } from './QueryValidator.ts'

export const isQuerySupportedByModule = async <T extends QueryBoundWitness = QueryBoundWitness>(
  mod: Module,
  query: T,
  payloads?: Payload[],
): Promise<boolean> => {
  const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
  const schema = (await wrapper.getQuery()).schema
  return mod.queries.includes(schema)
}

export class SupportedQueryValidator implements QueryValidator {
  protected readonly mod: Module
  constructor(mod: Module) {
    this.mod = mod
  }

  queryable: Queryable = (query, payloads) => {
    return isQuerySupportedByModule(this.mod, query, payloads)
  }
}
