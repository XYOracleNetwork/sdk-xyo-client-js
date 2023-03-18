import { XyoPayload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const validateDiscoverResponseContainsQuerySchemas = (response: XyoPayload[], querySchemas: string[]) => {
  const queries = response.filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
  expect(queries.length).toBeGreaterThan(0)
  querySchemas.forEach((querySchema) => {
    expect(queries.some((p) => p.query === querySchema)).toBeTrue()
  })
}
