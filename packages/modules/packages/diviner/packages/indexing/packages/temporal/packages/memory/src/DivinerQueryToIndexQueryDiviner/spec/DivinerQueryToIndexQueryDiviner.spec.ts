import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../Diviner'

type QueryType = Payload<PayloadDivinerQueryPayload & Payload<{ status?: number; success?: boolean; url: string }>>

describe('TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner', () => {
  let diviner: TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner
  const queries: QueryType[] = [
    {
      schema: PayloadDivinerQuerySchema,
      url: 'https://xyo.network',
    },
    {
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: PayloadDivinerQuerySchema,
      status: 200,
      success: true,
      url: 'https://xyo.network',
    },
    {
      limit: 10,
      schema: PayloadDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      offset: 10,
      schema: PayloadDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      order: 'asc',
      schema: PayloadDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      schema: PayloadDivinerQuerySchema,
      status: 200,
      url: 'https://explore.xyo.network',
    },
    {
      schema: PayloadDivinerQuerySchema,
      success: true,
      url: 'https://explore.xyo.network',
    },
    {
      schema: PayloadDivinerQuerySchema,
      success: false,
      url: 'https://explore.xyo.network',
    },
  ]
  const expected: PayloadDivinerQueryPayload[] = [
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
      success: true,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 10,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 10,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: true,
    } as unknown as PayloadDivinerQueryPayload,
    {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: false,
    } as unknown as PayloadDivinerQueryPayload,
  ]
  const cases: [QueryType, PayloadDivinerQueryPayload][] = queries.map((query, i) => [query, expected[i]])
  beforeAll(async () => {
    diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create()
  })
  describe.skip('divine', () => {
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
