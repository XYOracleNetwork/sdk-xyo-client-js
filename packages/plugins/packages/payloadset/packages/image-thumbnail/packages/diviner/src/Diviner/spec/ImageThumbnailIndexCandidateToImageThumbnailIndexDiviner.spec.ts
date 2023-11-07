import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnail, ImageThumbnailSchema, isImageThumbnailResultIndex } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner } from '../ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner'

describe('ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner', () => {
  let diviner: ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner
  const timestamp = 1234567890
  const results: ImageThumbnail[] = [
    {
      http: {
        status: 200,
      },
      schema: ImageThumbnailSchema,
      sourceUrl: 'https://xyo.network',
      url: 'data',
    },
  ]
  const timestampPayload: TimeStamp = { schema: TimestampSchema, timestamp }
  beforeAll(async () => {
    diviner = await ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner.create()
  })
  describe('divine', () => {
    it.each(results)('transforms', async (imageThumbnailPayload) => {
      const [boundWitness] = await new BoundWitnessBuilder().payloads([imageThumbnailPayload, timestampPayload]).build()
      const result = await diviner.divine([boundWitness, imageThumbnailPayload, timestampPayload])
      const payloadDictionary = await PayloadHasher.toMap([boundWitness, imageThumbnailPayload, timestampPayload])
      expect(result).toBeArrayOfSize(1)
      expect(result.filter(isImageThumbnailResultIndex)).toBeArrayOfSize(1)
      const [index] = result.filter(isImageThumbnailResultIndex)
      const key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: imageThumbnailPayload.sourceUrl })
      expect(index.key).toBe(key)
      expect(index.sources).toEqual(Object.keys(payloadDictionary))
      expect(index.success).toBe(true)
      expect(index.timestamp).toBe(1234567890)
      expect(index.status).toBe(200)
    })
  })
})
