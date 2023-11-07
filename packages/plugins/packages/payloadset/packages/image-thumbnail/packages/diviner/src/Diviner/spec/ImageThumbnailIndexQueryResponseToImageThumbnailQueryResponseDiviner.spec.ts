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
  ]
  const results: ImageThumbnailResultIndex[] = [
    {
      key: 'setInBeforeAll',
      schema: ImageThumbnailResultIndexSchema,
      sources: [],
      status: 200,
      success: true,
      timestamp,
    },
  ]
  let diviner: ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner
  beforeAll(async () => {
    diviner = await ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner.create()
    await Promise.all(
      queries.map(async (query, i) => {
        results[i].key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: query.url })
      }),
    )
  })
  const cases: [ImageThumbnailDivinerQuery, ImageThumbnailResultIndex][] = queries.map((query, i) => [query, results[i]])
  describe('divine', () => {
    it.each(cases)('transforms', async (imageThumbnailDivinerQuery, imageThumbnailResultIndex) => {
      const result = await diviner.divine([imageThumbnailDivinerQuery, imageThumbnailResultIndex])
      expect(result).toBeArrayOfSize(1)
      expect(result.filter(isImageThumbnailResult)).toBeArrayOfSize(1)
      const [index] = result.filter(isImageThumbnailResult)
      expect(index.url).toBe(imageThumbnailDivinerQuery.url)
      expect(index.success).toBe(true)
      expect(index.timestamp).toBe(1234567890)
      expect(index.status).toBe(200)
    })
  })
})
