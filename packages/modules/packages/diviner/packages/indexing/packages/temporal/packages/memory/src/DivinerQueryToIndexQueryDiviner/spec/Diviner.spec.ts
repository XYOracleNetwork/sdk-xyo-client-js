import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import {
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig,
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../Diviner'

type QueryType = PayloadDivinerQueryPayload<{ status?: number; success?: boolean; url: string }>

describe('TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner', () => {
  const url = 'https://xyo.network'
  let diviner: TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner
  describe('divine', () => {
    describe('with with no config specified', () => {
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
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 10,
          offset: 10,
          order: 'asc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          status: 200,
          success: true,
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 10,
          offset: 0,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 1,
          offset: 10,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 1,
          offset: 0,
          order: 'asc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 1,
          offset: 0,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          status: 200,
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 1,
          offset: 0,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          success: true,
          url,
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 1,
          offset: 0,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
          success: false,
          url,
        } as unknown as PayloadDivinerQueryPayload,
      ]
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create()
      })
      const cases: [QueryType, PayloadDivinerQueryPayload][] = queries.map((query, i) => [query, expected[i]])
      describe('with single query', () => {
        it.each(cases)('transforms query using default settings', async (query, expected) => {
          const results = await diviner.divine([query])
          const actual = results.filter(isPayloadDivinerQueryPayload)
          expect(actual).toBeArrayOfSize(1)
          expect(actual?.[0]).toEqual(expected)
        })
      })
      describe('with multiple queries', () => {
        it('transforms queries using default settings', async () => {
          const results = await diviner.divine(queries)
          const actual = results.filter(isPayloadDivinerQueryPayload)
          expect(actual).toBeArrayOfSize(expected.length)
          expect(actual).toEqual(expected)
        })
      })
    })
    describe('with config fields specified', () => {
      const divinerQuerySchema = 'network.xyo.test.source.query'
      const indexQuerySchema = 'network.xyo.test.destination.query'
      const indexSchema = 'network.xyo.test.index.schema'
      const queries = [
        {
          schema: divinerQuerySchema,
          url,
        },
        {
          limit: 10,
          offset: 10,
          order: 'asc',
          schema: divinerQuerySchema,
          status: 200,
          success: true,
          url,
        },
      ]
      const expected = [
        {
          limit: 1,
          offset: 0,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          url,
        },
        {
          limit: 10,
          offset: 10,
          order: 'asc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          status: 200,
          success: true,
          url,
        } as unknown as PayloadDivinerQueryPayload,
      ]
      const cases: [Payload, Payload][] = queries.map((query, i) => [query, expected[i]])
      beforeAll(async () => {
        const config: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = {
          divinerQuerySchema,
          indexQuerySchema,
          indexSchema,
          schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
        }
        diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create({ config })
      })
      describe('with single query', () => {
        it.each(cases)('transforms query using default settings', async (query, expected) => {
          const results = await diviner.divine([query])
          const actual = results.filter(isPayloadOfSchemaType(indexQuerySchema))
          expect(actual).toBeArrayOfSize(1)
          expect(actual?.[0]).toEqual(expected)
        })
      })
      describe('with multiple queries', () => {
        it('transforms queries using default settings', async () => {
          const results = await diviner.divine(queries)
          const actual = results.filter(isPayloadOfSchemaType(indexQuerySchema))
          expect(actual).toBeArrayOfSize(expected.length)
          expect(actual).toEqual(expected)
        })
      })
    })
  })
})
