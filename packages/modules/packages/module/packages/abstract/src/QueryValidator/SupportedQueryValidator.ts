import { Module, ModuleQuery, QueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { QueryBoundWitnessWrapper } from '../Query'
import { Queryable, QueryValidator } from './QueryValidator'

export const isQuerySupportedByModule = async <T extends QueryBoundWitness = QueryBoundWitness>(
  mod: Module,
  query: T,
  payloads?: Payload[],
): Promise<boolean> => {
  const wrapper = await QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
  const schema = (await wrapper.getQuery()).schema
  return mod.queries.includes(schema)
}

export class SupportedQueryValidator implements QueryValidator {
  constructor(protected readonly mod: Module) {}
  queryable: Queryable = (query, payloads) => {
    return isQuerySupportedByModule(this.mod, query, payloads)
  }
}
