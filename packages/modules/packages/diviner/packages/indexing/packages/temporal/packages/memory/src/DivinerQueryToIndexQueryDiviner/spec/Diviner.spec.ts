import '@xylabs/vitest-extended'

import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { isPayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import type { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig } from '@xyo-network/diviner-temporal-indexing-model'
import {
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../Diviner.ts'

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
          order: 'asc',
          schema: PayloadDivinerQuerySchema,
        },
      ]
      const expected: PayloadDivinerQueryPayload[] = [
        {
          limit: 1,
          order: 'desc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
        } as unknown as PayloadDivinerQueryPayload,
        {
          limit: 10,
          order: 'asc',
          schema: 'network.xyo.diviner.payload.query',
          schemas: [TemporalIndexingDivinerResultIndexSchema],
        } as unknown as PayloadDivinerQueryPayload,
      ]
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create({ account: 'random' })
      })
      const cases: [QueryType, PayloadDivinerQueryPayload][] = queries.map((query, i) => [query, expected[i]])
      describe('with single query', () => {
        it.each(cases)('transforms query using default settings', async (query, expected) => {
          const results = await diviner.divine([query])
          const actual = results.filter(isPayloadDivinerQueryPayload)
          expect(actual).toBeArrayOfSize(1)
          expect(PayloadBuilder.omitMeta(actual[0])).toEqual(PayloadBuilder.omitMeta(expected))
        })
      })
      describe('with multiple queries', () => {
        it('transforms queries using default settings', async () => {
          const results = await diviner.divine(queries)
          const actual = results.filter(isPayloadDivinerQueryPayload)
          expect(actual).toBeArrayOfSize(expected.length)
          expect(actual.map(i => PayloadBuilder.omitMeta(i))).toEqual(expected.map(i => PayloadBuilder.omitMeta(i)))
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
          order: 'asc',
          schema: divinerQuerySchema,
          status: 200,
          success: true,
          url,
        },
        {
          limit: 10,
          schema: divinerQuerySchema,
          url,
        },
        {
          schema: divinerQuerySchema,
          url,
        },
        {
          order: 'asc',
          schema: divinerQuerySchema,
          url,
        },
        {
          schema: divinerQuerySchema,
          status: 200,
          url,
        },
        {
          schema: divinerQuerySchema,
          success: true,
          url,
        },
        {
          schema: divinerQuerySchema,
          success: false,
          url,
        },
      ]
      const expected = [
        {
          limit: 1,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          url,
        },
        {
          limit: 10,
          order: 'asc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          status: 200,
          success: true,
          url,
        },
        {
          limit: 10,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          url,
        },
        {
          limit: 1,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          url,
        },
        {
          limit: 1,
          order: 'asc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          url,
        },
        {
          limit: 1,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          status: 200,
          url,
        },
        {
          limit: 1,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          success: true,
          url,
        },
        {
          limit: 1,
          order: 'desc',
          schema: indexQuerySchema,
          schemas: [indexSchema],
          success: false,
          url,
        },
      ]
      const cases: [Payload, Payload][] = queries.map((query, i) => [query, expected[i]])
      const schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary = {
        [divinerQuerySchema]: [
          {
            destinationField: 'url',
            sourcePathExpression: '$.url',
          },
          {
            defaultValue: 1,
            destinationField: 'limit',
            sourcePathExpression: '$.limit',
          },
          {
            // defaultValue: 0,
            destinationField: 'cursor',
            sourcePathExpression: '$.cursor',
          },
          {
            defaultValue: 'desc',
            destinationField: 'order',
            sourcePathExpression: '$.order',
          },
          {
            destinationField: 'status',
            sourcePathExpression: '$.status',
          },
          {
            destinationField: 'success',
            sourcePathExpression: '$.success',
          },
        ],
      }
      const config: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfig = {
        divinerQuerySchema,
        indexQuerySchema,
        indexSchema,
        schema: TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
        schemaTransforms,
      }
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.create({ account: 'random', config })
      })
      describe('with single query', () => {
        it.each(cases)('transforms query using default settings', async (query, expected) => {
          const results = await diviner.divine([query])
          const actual = results.filter(isPayloadOfSchemaType<Payload>(indexQuerySchema))
          expect(actual).toBeArrayOfSize(1)
          expect(PayloadBuilder.omitMeta(actual[0])).toEqual(PayloadBuilder.omitMeta(expected))
        })
      })
      describe('with multiple queries', () => {
        it('transforms queries using default settings', async () => {
          const results = await diviner.divine(queries)
          const actual = results.filter(isPayloadOfSchemaType<Payload>(indexQuerySchema))
          expect(actual).toBeArrayOfSize(expected.length)
          expect(actual.map(i => PayloadBuilder.omitMeta(i))).toEqual(expected.map(i => PayloadBuilder.omitMeta(i)))
        })
      })
    })
  })
})
