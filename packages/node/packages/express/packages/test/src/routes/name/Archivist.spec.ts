import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ModuleQueryBase } from '@xyo-network/modules'
import { Payload, XyoPayload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

const path = '/Archivist'

describe('/Archivist', () => {
  describe('GET', () => {
    it('issues Discover query', async () => {
      const response = await (await request()).get(path).redirects(1).expect(StatusCodes.OK)
      expect(response.body.data).toBeArray()
      const data: Payload[] = response.body.data
      expect(data).toBeArray()
      validateDiscoverResponseContains(data, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
})

const validateDiscoverResponseContains = (data: XyoPayload[], querySchemas: string[]) => {
  const queries = data.filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
  expect(queries.length).toBeGreaterThan(0)
  querySchemas.forEach((querySchema) => {
    expect(queries.some((p) => p.query === querySchema)).toBeTrue()
  })
}
