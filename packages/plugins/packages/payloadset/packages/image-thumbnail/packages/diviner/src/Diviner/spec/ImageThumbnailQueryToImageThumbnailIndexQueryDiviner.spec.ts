import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnailDivinerQuery, ImageThumbnailDivinerQuerySchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailQueryToImageThumbnailIndexQueryDiviner } from '../ImageThumbnailQueryToImageThumbnailIndexQueryDiviner'
import { ImageThumbnailResultQuery, isImageThumbnailResultQuery } from '../ImageThumbnailResultQuery'

describe('ImageThumbnailQueryToImageThumbnailIndexQueryDiviner', () => {
  let diviner: ImageThumbnailQueryToImageThumbnailIndexQueryDiviner
  const queries: ImageThumbnailDivinerQuery[] = [
    {
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://xyo.network',
    },
    {
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: ImageThumbnailDivinerQuerySchema,
      status: 200,
      success: true,
      url: 'https://xyo.network',
    },
    {
      limit: 10,
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      offset: 10,
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      order: 'asc',
      schema: ImageThumbnailDivinerQuerySchema,
      url: 'https://explore.xyo.network',
    },
    {
      schema: ImageThumbnailDivinerQuerySchema,
      status: 200,
      url: 'https://explore.xyo.network',
    },
    {
      schema: ImageThumbnailDivinerQuerySchema,
      success: true,
      url: 'https://explore.xyo.network',
    },
    {
      schema: ImageThumbnailDivinerQuerySchema,
      success: false,
      url: 'https://explore.xyo.network',
    },
  ]
  const expected: ImageThumbnailResultQuery[] = [
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 10,
      offset: 10,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
      success: true,
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 10,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 10,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 0,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      status: 200,
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: true,
    } as unknown as ImageThumbnailResultQuery,
    {
      key: 'setInBeforeAll',
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      success: false,
    } as unknown as ImageThumbnailResultQuery,
  ]
  const cases: [ImageThumbnailDivinerQuery, ImageThumbnailResultQuery][] = queries.map((query, i) => [query, expected[i]])
  beforeAll(async () => {
    diviner = await ImageThumbnailQueryToImageThumbnailIndexQueryDiviner.create()
    queries.forEach(async (query, i) => {
      const key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: query.url })
      expected[i].key = key
    })
  })
  describe('divine', () => {
    describe('with single query', () => {
      it.each(cases)('transforms', async (query, expected) => {
        const results = await diviner.divine([query])
        const actual = results.filter(isImageThumbnailResultQuery)
        expect(actual).toBeArrayOfSize(1)
        expect(actual?.[0]).toEqual(expected)
      })
    })
  })
})
