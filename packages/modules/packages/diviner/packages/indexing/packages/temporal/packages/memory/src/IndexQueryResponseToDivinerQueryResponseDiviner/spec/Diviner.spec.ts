import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner } from '../Diviner'

type QueryType = Payload<PayloadDivinerQueryPayload & Payload<{ status?: number; success?: boolean; url: string }>>

describe('TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner', () => {
  const queries: QueryType[] = [
    {
      schema: PayloadDivinerQuerySchema,
      url: 'https://xyo.network',
    },
    {
      schema: PayloadDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
  ]
  const indexes = [
    [
      {
        schema: 'TODO',
        sources: [],
        status: 200,
        success: true,
        timestamp: 1234567890,
      },
    ],
    [
      {
        schema: 'TODO',
        sources: [],
        status: 200,
        success: true,
        timestamp: 1234567891,
      },
      {
        schema: 'TODO',
        sources: [],
        status: 500,
        success: false,
        timestamp: 1234567892,
      },
    ],
  ]
  let diviner: TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner
  beforeAll(async () => {
    diviner = await TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner.create()
  })
  const cases: [QueryType, Payload[]][] = queries.map((query, i) => [query, indexes[i]])
  describe('divine', () => {
    describe('with single url in index result', () => {
      it.each(cases)('transforms single url index results', async (imageThumbnailDivinerQuery, imageThumbnailResultIndex) => {
        const results = await diviner.divine([imageThumbnailDivinerQuery, ...imageThumbnailResultIndex])
        expect(results).toBeArrayOfSize(imageThumbnailResultIndex.length)
        expect(results).toBeArrayOfSize(imageThumbnailResultIndex.length)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results.forEach((result: any, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const index = imageThumbnailResultIndex[i] as any
          expect(result.url).toBe(imageThumbnailDivinerQuery.url)
          expect(result.success).toBe(index.success)
          expect(result.timestamp).toBe(index.timestamp)
          expect(result.status).toBe(index.status)
          expect(result.schema).toBe('TODO')
        })
      })
    })
    describe('with multiple urls in index result', () => {
      it('transforms multiple url index results', async () => {
        const indexesLength = indexes.flat().length
        const results = await diviner.divine([...queries, ...indexes.flat()])
        expect(results).toBeArrayOfSize(indexesLength)
        expect(results).toBeArrayOfSize(indexesLength)
        let resultsIterator = 0
        for (let i = 0; i < queries.length; i++) {
          const { url } = queries[i]
          const indexSet = indexes[i]
          for (let j = 0; j < indexSet.length; j++) {
            const index = indexSet[j]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = results[resultsIterator] as any
            expect(result.url).toBe(url)
            expect(result.success).toBe(index.success)
            expect(result.timestamp).toBe(index.timestamp)
            expect(result.status).toBe(index.status)
            expect(result.schema).toBe('TODO')
            resultsIterator = ++resultsIterator
          }
        }
      })
    })
  })
})
