import { PayloadHasher } from '@xyo-network/core'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import {
  ImageThumbnailResultIndex,
  ImageThumbnailResultIndexSchema,
  ImageThumbnailResultSchema,
  isImageThumbnailResult,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner } from '../IndexQueryResponseToDivinerQueryResponseDiviner'

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
  const indexes: ImageThumbnailResultIndex[][] = [
    [
      {
        key: 'setInBeforeAll',
        schema: ImageThumbnailResultIndexSchema,
        sources: [],
        status: 200,
        success: true,
        timestamp: 1234567890,
      },
    ],
    [
      {
        key: 'setInBeforeAll',
        schema: ImageThumbnailResultIndexSchema,
        sources: [],
        status: 200,
        success: true,
        timestamp: 1234567891,
      },
      {
        key: 'setInBeforeAll',
        schema: ImageThumbnailResultIndexSchema,
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
    await Promise.all(
      queries.map((query, i) => {
        indexes[i].forEach(async (index) => {
          index.key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: query.url })
        })
      }),
    )
  })
  const cases: [QueryType, ImageThumbnailResultIndex[]][] = queries.map((query, i) => [query, indexes[i]])
  describe.skip('divine', () => {
    describe('with single url in index result', () => {
      it.each(cases)('transforms single url index results', async (imageThumbnailDivinerQuery, imageThumbnailResultIndex) => {
        const results = await diviner.divine([imageThumbnailDivinerQuery, ...imageThumbnailResultIndex])
        expect(results).toBeArrayOfSize(imageThumbnailResultIndex.length)
        expect(results.filter(isImageThumbnailResult)).toBeArrayOfSize(imageThumbnailResultIndex.length)
        results.filter(isImageThumbnailResult).forEach((result, i) => {
          const index = imageThumbnailResultIndex[i]
          expect(result.url).toBe(imageThumbnailDivinerQuery.url)
          expect(result.success).toBe(index.success)
          expect(result.timestamp).toBe(index.timestamp)
          expect(result.status).toBe(index.status)
          expect(result.schema).toBe(ImageThumbnailResultSchema)
        })
      })
    })
    describe('with multiple urls in index result', () => {
      it('transforms multiple url index results', async () => {
        const indexesLength = indexes.flat().length
        const results = await diviner.divine([...queries, ...indexes.flat()])
        expect(results).toBeArrayOfSize(indexesLength)
        const resultsIndexes = results.filter(isImageThumbnailResult)
        expect(resultsIndexes).toBeArrayOfSize(indexesLength)
        let resultsIterator = 0
        for (let i = 0; i < queries.length; i++) {
          const { url } = queries[i]
          const indexSet = indexes[i]
          for (let j = 0; j < indexSet.length; j++) {
            const index = indexSet[j]
            const result = resultsIndexes[resultsIterator]
            expect(result.url).toBe(url)
            expect(result.success).toBe(index.success)
            expect(result.timestamp).toBe(index.timestamp)
            expect(result.status).toBe(index.status)
            expect(result.schema).toBe(ImageThumbnailResultSchema)
            resultsIterator = ++resultsIterator
          }
        }
      })
    })
  })
})
