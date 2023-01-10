import { Promisable } from '@xyo-network/promise'

import { AbstractModule } from '../AbstractModule'
import { QueryBoundWitnessWrapper } from '../Query'

export type Queryable<T extends QueryBoundWitnessWrapper = QueryBoundWitnessWrapper> = (query: T, module: AbstractModule) => Promisable<boolean>

export interface QueryValidator<T extends QueryBoundWitnessWrapper = QueryBoundWitnessWrapper> {
  queryable: Queryable<T>
}
