import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnail, ImageThumbnailSchema, isImageThumbnailResultIndex } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner } from '../ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner'

describe('ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner', () => {
  let diviner: ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner
  const timestampA = 1234567890
  const timestampPayloadA: TimeStamp = { schema: TimestampSchema, timestamp: timestampA }
  const imageThumbnailPayloadA: ImageThumbnail = {
    http: {
      status: 200,
    },
    schema: ImageThumbnailSchema,
    sourceUrl: 'https://xyo.network',
    url: 'data',
  }
  const timestampB = 1234567891
  const timestampPayloadB: TimeStamp = { schema: TimestampSchema, timestamp: timestampB }
  const imageThumbnailPayloadB: ImageThumbnail = {
    http: {
      status: 500,
    },
    schema: ImageThumbnailSchema,
    sourceUrl: 'https://xyo.network',
  }
  beforeAll(async () => {
    diviner = await ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner.create()
  })
  describe('divine', () => {
    const cases: [ImageThumbnail, TimeStamp][] = [
      [imageThumbnailPayloadA, timestampPayloadA],
      [imageThumbnailPayloadB, timestampPayloadB],
    ]
    describe('with single result', () => {
      it.each(cases)('transforms single result', async (thumbnail, timestamp) => {
        const [boundWitness] = await new BoundWitnessBuilder().payloads([thumbnail, timestamp]).build()
        const result = await diviner.divine([boundWitness, thumbnail, timestamp])
        const payloadDictionary = await PayloadHasher.toMap([boundWitness, thumbnail, timestamp])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isImageThumbnailResultIndex)).toBeArrayOfSize(1)
        const [index] = result.filter(isImageThumbnailResultIndex)
        const key = await PayloadHasher.hashAsync({ schema: UrlSchema, url: thumbnail.sourceUrl })
        expect(index.key).toBe(key)
        expect(index.sources).toEqual(Object.keys(payloadDictionary))
        expect(index.success).toBe(thumbnail.http?.status === 200)
        expect(index.timestamp).toBe(timestamp.timestamp)
        expect(index.status).toBe(thumbnail.http?.status)
      })
    })
    describe('with multiple results', () => {
      it('transforms multiple results', async () => {
        const data = (
          await Promise.all(
            cases.map(async (payloads) => {
              const [bw] = await new BoundWitnessBuilder().payloads(payloads).build()
              return [bw, ...payloads]
            }),
          )
        ).flat()
        const result = await diviner.divine(data)
        const payloadDictionary = await PayloadHasher.toMap(data)
        expect(result).toBeArrayOfSize(2)
      })
    })
  })
})
