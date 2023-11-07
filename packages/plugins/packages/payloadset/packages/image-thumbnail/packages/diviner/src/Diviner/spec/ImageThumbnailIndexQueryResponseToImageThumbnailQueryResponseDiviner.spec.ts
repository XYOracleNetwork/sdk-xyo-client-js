import { PayloadHasher } from '@xyo-network/core'
import {
  ImageThumbnailDivinerQuery,
  ImageThumbnailDivinerQuerySchema,
  ImageThumbnailResultIndex,
  ImageThumbnailResultIndexSchema,
  isImageThumbnailResult,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner } from '../ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner'

describe('ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner', () => {
  const timestamp = 1234567890
  const queries: ImageThumbnailDivinerQuery[] = [
    {
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://xyo.network',
    },
    {
      schema: ImageThumbnailDivinerQuerySchema,
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
  let diviner: ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner
  beforeAll(async () => {
    diviner = await ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner.create()
    await Promise.all(
      queries.map((query, i) => {
        indexes[i].forEach(async (index) => {
          index.key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: query.url })
        })
      }),
    )
  })
  const cases: [ImageThumbnailDivinerQuery, ImageThumbnailResultIndex[]][] = queries.map((query, i) => [query, indexes[i]])
  describe('divine', () => {
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
            resultsIterator = ++resultsIterator
          }
        }
      })
    })
  })
})
