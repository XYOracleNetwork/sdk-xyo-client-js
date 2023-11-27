import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../Diviner'

type QueryType = PayloadDivinerQueryPayload<{ status?: number; success?: boolean; url: string }>

describe('TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner', () => {
  const url = 'https://xyo.network'
  let diviner: TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner
  const queries: QueryType[] = [
    {
      schema: PayloadDivinerQuerySchema,
      url,
    },
    {
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: PayloadDivinerQuerySchema,
      status: 200,
      success: true,
      url,
    },
    {
      limit: 10,
      schema: PayloadDivinerQuerySchema,
      url,
    },
    {
      offset: 10,
      schema: PayloadDivinerQuerySchema,
      url,
    },
    {
      order: 'asc',
      schema: PayloadDivinerQuerySchema,
      url,
    },
    {
      schema: PayloadDivinerQuerySchema,
      status: 200,
      url,
    },
    {
      schema: PayloadDivinerQuerySchema,
      success: true,
      url,
    },
    {
      schema: PayloadDivinerQuerySchema,
      success: false,
      url,
    },
  ]
  const expected: PayloadDivinerQueryPayload[] = [
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
      success: true,
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 10,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 10,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: true,
      url,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: false,
      url,
    } as unknown as PayloadDivinerQueryPayload,
  ]
  const cases: [QueryType, PayloadDivinerQueryPayload][] = queries.map((query, i) => [query, expected[i]])
  beforeAll(async () => {
    diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create()
  })
  describe('divine', () => {
    describe('with single query', () => {
      it.each(cases)('transforms query', async (query, expected) => {
        const results = await diviner.divine([query])
        const actual = results.filter(isPayloadDivinerQueryPayload)
        expect(actual).toBeArrayOfSize(1)
        expect(actual?.[0]).toEqual(expected)
      })
    })
    describe('with multiple queries', () => {
      it('transforms queries', async () => {
        const results = await diviner.divine(queries)
        const actual = results.filter(isPayloadDivinerQueryPayload)
        expect(actual).toBeArrayOfSize(expected.length)
        expect(actual).toEqual(expected)
      })
    })
  })
})
