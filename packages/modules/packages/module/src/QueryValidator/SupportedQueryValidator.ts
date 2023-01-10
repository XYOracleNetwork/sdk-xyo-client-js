import { Queryable } from './QueryValidator'

export const supportedQueryValidator: Queryable = (query, mod) => {
  return mod.queries().includes(query.query.payload.schema)
}
