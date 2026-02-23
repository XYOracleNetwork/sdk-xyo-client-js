import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { ModuleQueries, QueryableModule } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { Queryable, QueryValidator } from './QueryValidator.ts'

export const isQuerySupportedByModule = async <T extends QueryBoundWitness = QueryBoundWitness>(
  mod: QueryableModule,
  query: T,
  payloads?: Payload[],
): Promise<boolean> => {
  const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
  const schema = (await wrapper.getQuery()).schema
  return mod.queries.includes(schema)
}

export class SupportedQueryValidator implements QueryValidator {
  protected readonly mod: QueryableModule
  constructor(mod: QueryableModule) {
    this.mod = mod
  }

  queryable: Queryable = (query, payloads) => {
    return isQuerySupportedByModule(this.mod, query, payloads)
  }
}
