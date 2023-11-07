import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnailDivinerQuery, ImageThumbnailDivinerQuerySchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailQueryToImageThumbnailIndexQueryDiviner } from '../ImageThumbnailQueryToImageThumbnailIndexQueryDiviner'
import { isImageThumbnailResultQuery } from '../ImageThumbnailResultQuery'

describe('ImageThumbnailQueryToImageThumbnailIndexQueryDiviner', () => {
  let diviner: ImageThumbnailQueryToImageThumbnailIndexQueryDiviner
  const cases: ImageThumbnailDivinerQuery[] = [
    {
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://xyo.network',
    },
  ]
  beforeAll(async () => {
    diviner = await ImageThumbnailQueryToImageThumbnailIndexQueryDiviner.create()
  })
  describe('divine', () => {
    it.each(cases)('transforms', async (imageThumbnailDivinerQuery) => {
      const results = await diviner.divine([imageThumbnailDivinerQuery])
      const actual = results.filter(isImageThumbnailResultQuery)
      expect(actual).toBeArrayOfSize(1)
      const { url } = imageThumbnailDivinerQuery
      const key = await PayloadHasher.hashAsync({ schema: UrlSchema, url })
      expect(actual?.[0]).toEqual({
        key,
        limit: 1,
        offset: 0,
        order: 'desc',
        schema: 'network.xyo.diviner.payload.query',
      })
    })
  })
})
