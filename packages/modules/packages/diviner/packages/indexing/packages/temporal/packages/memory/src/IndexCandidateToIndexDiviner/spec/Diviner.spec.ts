import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { isTemporalIndexingDivinerResultIndex } from '@xyo-network/diviner-temporal-indexing-model'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { StringToJsonPathTransformExpressionsDictionary } from '../../lib'
import { TemporalIndexingDivinerIndexCandidateToIndexDiviner } from '../Diviner'

describe('TemporalIndexCandidateToImageThumbnailIndexDiviner', () => {
  describe('divine', () => {
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
    const timestampC = 1234567892
    const timestampPayloadC: TimeStamp = { schema: TimestampSchema, timestamp: timestampC }
    const imageThumbnailPayloadC: ImageThumbnail = {
      http: {
        ipAddress: '192.169.1.1',
      },
      schema: ImageThumbnailSchema,
      sourceUrl: 'https://www.google.com',
    }
    describe('with single schema transform', () => {
      const validateSingleResult = async (
        input: [boundWitness: BoundWitness, timestamp: TimeStamp, thumbnail: ImageThumbnail],
        result: Payload[],
      ) => {
        const [boundWitness, timestamp, thumbnail] = input
        const payloadDictionary = await PayloadHasher.toMap([boundWitness, timestamp, thumbnail])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isTemporalIndexingDivinerResultIndex)).toBeArrayOfSize(1)
        const [index] = result.filter(isTemporalIndexingDivinerResultIndex)
        expect(index.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index.timestamp).toBe(timestamp.timestamp)
        expect((index as { url?: string })?.url).toBe(thumbnail.sourceUrl)
        expect((index as { status?: number })?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerIndexCandidateToIndexDiviner.create({
          config: {
            schema: TemporalIndexingDivinerIndexCandidateToIndexDiviner.configSchema,
            schemaTransforms,
          },
        })
      })
      const schemaTransforms: StringToJsonPathTransformExpressionsDictionary = {
        'network.xyo.image.thumbnail': [
          { destinationField: 'url', sourcePathExpression: '$.sourceUrl' },
          { destinationField: 'status', sourcePathExpression: '$.http.status' },
        ],
      }
      let diviner: TemporalIndexingDivinerIndexCandidateToIndexDiviner

      const cases: [TimeStamp, ImageThumbnail][] = [
        [timestampPayloadA, imageThumbnailPayloadA],
        [timestampPayloadB, imageThumbnailPayloadB],
        [timestampPayloadC, imageThumbnailPayloadC],
      ]
      describe('with single result', () => {
        it.each(cases)('transforms single result', async (timestamp, thumbnail) => {
          const [boundWitness] = await new BoundWitnessBuilder().payloads([timestamp, thumbnail]).build()
          const result = await diviner.divine([boundWitness, timestamp, thumbnail])
          await validateSingleResult([boundWitness, timestamp, thumbnail], result)
        })
        it.each(cases)('handles sparse inputs', async (thumbnail, timestamp) => {
          const [boundWitness] = await new BoundWitnessBuilder().payloads([timestamp, thumbnail]).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
        })
      })
      describe('with multiple results', () => {
        it('transforms multiple results', async () => {
          const data: [BoundWitness, TimeStamp, ImageThumbnail][] = await Promise.all(
            cases.map(async (payloads) => {
              const [bw] = await new BoundWitnessBuilder().payloads(payloads).build()
              return [bw, ...payloads]
            }),
          )
          const results = await diviner.divine(data.flat())
          expect(results).toBeArrayOfSize(cases.length)
          data.forEach(async (input, i) => {
            const result = results[i]
            await validateSingleResult(input, [result])
          })
        })
        it('handles sparse inputs', async () => {
          const [bw] = await new BoundWitnessBuilder().payloads(cases[0]).build()
          const results = await diviner.divine([bw, ...cases.flat()])
          expect(results).toBeArrayOfSize(1)
          await validateSingleResult([bw, ...cases[0]], results)
        })
      })
    })
    describe('with multiple schema transforms', () => {
      const validateMultiResult = async (
        input: [boundWitness: BoundWitness, timestamp: TimeStamp, thumbnail: ImageThumbnail, payload: Payload],
        result: Payload[],
      ) => {
        const [boundWitness, timestamp, thumbnail, payload] = input
        const payloadDictionary = await PayloadHasher.toMap([boundWitness, timestamp, thumbnail, payload])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isTemporalIndexingDivinerResultIndex)).toBeArrayOfSize(1)
        const [index] = result.filter(isTemporalIndexingDivinerResultIndex)
        expect(index.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index.timestamp).toBe(timestamp.timestamp)
        expect((index as { url?: string })?.url).toBe((payload as { sourceUrl?: string }).sourceUrl)
        expect((index as { status?: number })?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerIndexCandidateToIndexDiviner.create({
          config: {
            schema: TemporalIndexingDivinerIndexCandidateToIndexDiviner.configSchema,
            schemaTransforms,
          },
        })
      })
      const schemaTransforms: StringToJsonPathTransformExpressionsDictionary = {
        'network.xyo.image.thumbnail': [{ destinationField: 'status', sourcePathExpression: '$.http.status' }],
        'network.xyo.image.thumbnail.other': [{ destinationField: 'url', sourcePathExpression: '$.sourceUrl' }],
      }
      let diviner: TemporalIndexingDivinerIndexCandidateToIndexDiviner

      const cases: [TimeStamp, ImageThumbnail, Payload<{ sourceUrl: string }>][] = [
        [
          timestampPayloadA,
          { ...imageThumbnailPayloadA, sourceUrl: '' },
          { schema: 'network.xyo.image.thumbnail.other', sourceUrl: imageThumbnailPayloadA.sourceUrl },
        ],
        [
          timestampPayloadB,
          { ...imageThumbnailPayloadB, sourceUrl: '' },
          { schema: 'network.xyo.image.thumbnail.other', sourceUrl: imageThumbnailPayloadB.sourceUrl },
        ],
        [
          timestampPayloadC,
          { ...imageThumbnailPayloadC, sourceUrl: '' },
          { schema: 'network.xyo.image.thumbnail.other', sourceUrl: imageThumbnailPayloadC.sourceUrl },
        ],
      ]
      describe('with single result', () => {
        it.each(cases)('transforms single result', async (timestamp, thumbnail, payload) => {
          const [boundWitness] = await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload]).build()
          const result = await diviner.divine([boundWitness, timestamp, thumbnail, payload])
          await validateMultiResult([boundWitness, timestamp, thumbnail, payload], result)
        })
        it.each(cases)('handles sparse inputs', async (thumbnail, timestamp, payload) => {
          const [boundWitness] = await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload]).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
        })
      })
      describe('with multiple results', () => {
        it('transforms multiple results', async () => {
          const data: [BoundWitness, TimeStamp, ImageThumbnail, Payload][] = await Promise.all(
            cases.map(async (payloads) => {
              const [bw] = await new BoundWitnessBuilder().payloads(payloads).build()
              return [bw, ...payloads]
            }),
          )
          const results = await diviner.divine(data.flat())
          expect(results).toBeArrayOfSize(cases.length)
          data.forEach(async (input, i) => {
            const result = results[i]
            await validateMultiResult(input, [result])
          })
        })
        it('handles sparse inputs', async () => {
          const [bw] = await new BoundWitnessBuilder().payloads(cases[0]).build()
          const results = await diviner.divine([bw, ...cases.flat()])
          expect(results).toBeArrayOfSize(1)
          await validateMultiResult([bw, ...cases[0]], results)
        })
      })
    })
  })
})
