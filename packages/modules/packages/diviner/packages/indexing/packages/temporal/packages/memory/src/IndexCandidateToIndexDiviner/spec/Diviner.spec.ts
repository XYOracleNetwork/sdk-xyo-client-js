import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import { isTemporalIndexingDivinerResultIndex } from '@xyo-network/diviner-temporal-indexing-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { TemporalIndexingDivinerIndexCandidateToIndexDiviner } from '../Diviner'

type ImageThumbnail = Payload<{
  http?: {
    ipAddress?: string
    status?: number
  }
  // schema: 'network.xyo.image.thumbnail'
  sourceUrl: string
  url?: string
}>

describe('TemporalIndexCandidateToImageThumbnailIndexDiviner', () => {
  describe('divine', () => {
    const timestampA = 1_234_567_890
    const timestampPayloadA: TimeStamp = { schema: TimestampSchema, timestamp: timestampA }
    const imageThumbnailPayloadA: ImageThumbnail = {
      http: {
        status: 200,
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://xyo.network',
      url: 'data',
    }
    const timestampB = 1_234_567_891
    const timestampPayloadB: TimeStamp = { schema: TimestampSchema, timestamp: timestampB }
    const imageThumbnailPayloadB: ImageThumbnail = {
      http: {
        status: 500,
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://xyo.network',
    }
    const timestampC = 1_234_567_892
    const timestampPayloadC: TimeStamp = { schema: TimestampSchema, timestamp: timestampC }
    const imageThumbnailPayloadC: ImageThumbnail = {
      http: {
        ipAddress: '192.169.1.1',
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://www.google.com',
    }
    describe('with single schema transform', () => {
      const validateSingleResult = async (
        input: [boundWitness: BoundWitness, timestamp: TimeStamp, thumbnail: ImageThumbnail],
        result: Payload[],
      ) => {
        const [boundWitness, timestamp, thumbnail] = input
        const payloadDictionary = await PayloadBuilder.toDataHashMap([boundWitness, timestamp, thumbnail])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isTemporalIndexingDivinerResultIndex)).toBeArrayOfSize(1)
        const index = result.find(isTemporalIndexingDivinerResultIndex)
        expect(index?.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index?.timestamp).toBe(timestamp.timestamp)
        expect((index as { url?: string })?.url).toBe(thumbnail.sourceUrl)
        expect((index as { status?: number })?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerIndexCandidateToIndexDiviner.create({
          account: 'random',
          config: {
            schema: TemporalIndexingDivinerIndexCandidateToIndexDiviner.defaultConfigSchema,
            schemaTransforms,
          },
        })
      })
      const schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary = {
        'network.xyo.image.thumbnail': [
          { destinationField: 'url', sourcePathExpression: '$.sourceUrl' },
          { destinationField: 'status', sourcePathExpression: '$.http.status' },
        ],
        'network.xyo.timestamp': [{ destinationField: 'timestamp', sourcePathExpression: '$.timestamp' }],
      }
      let diviner: TemporalIndexingDivinerIndexCandidateToIndexDiviner

      const cases: [TimeStamp, ImageThumbnail][] = [
        [timestampPayloadA, imageThumbnailPayloadA],
        [timestampPayloadB, imageThumbnailPayloadB],
        [timestampPayloadC, imageThumbnailPayloadC],
      ]
      describe('with single result', () => {
        it.each(cases)('transforms single result', async (timestamp, thumbnail) => {
          const builtTimestamp = await PayloadBuilder.build(timestamp)
          const builtThumbnail = await PayloadBuilder.build(thumbnail)
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([builtTimestamp, builtThumbnail])).build()
          const result = await diviner.divine([boundWitness, builtTimestamp, builtThumbnail])
          await validateSingleResult([boundWitness, builtTimestamp, builtThumbnail], result)
        })
        it('transforms BW with multiple results inside', async () => {
          const payloads = cases.flat()
          const builtPayloads = await PayloadBuilder.build(payloads)
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads(builtPayloads)).build()
          const results = await diviner.divine([boundWitness, ...builtPayloads])
          expect(results).toBeArrayOfSize(Math.pow(cases.length, cases[0].length))
          let resultIndex = 0
          for (let i = 0; i < cases.length; i++) {
            const thumbnail = cases[i][1]
            // eslint-disable-next-line unicorn/no-for-loop
            for (let j = 0; j < cases.length; j++) {
              const timestamp = cases[j][0]
              const result = results[resultIndex]
              await validateSingleResult([boundWitness, timestamp, thumbnail], [result])
              resultIndex++
            }
          }
        })
        it.each(cases)('handles sparse inputs', async (thumbnail, timestamp) => {
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail])).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
        })
      })
      describe('with multiple results', () => {
        it('transforms multiple results', async () => {
          const data: [BoundWitness, TimeStamp, ImageThumbnail][] = await Promise.all(
            cases.map(async (payloads) => {
              const [bw] = await (await new BoundWitnessBuilder().payloads(payloads)).build()
              return [bw, ...payloads]
            }),
          )
          const results = await diviner.divine(data.flat())
          expect(results).toBeArrayOfSize(cases.length)
          // eslint-disable-next-line unicorn/no-array-for-each
          await Promise.all(
            data.map(async (input, i) => {
              const result = results[i]
              await validateSingleResult(input, [result])
            }),
          )
        })
        it('handles sparse inputs', async () => {
          const [bw] = await (await new BoundWitnessBuilder().payloads(cases[0])).build()
          const results = await diviner.divine([bw, ...cases.flat()])
          expect(results).toBeArrayOfSize(1)
          await validateSingleResult([bw, ...cases[0]], results)
        })
        it('handles missing inputs', async () => {
          const [bw] = await (await new BoundWitnessBuilder().payloads([...cases[0]])).build()
          const results = await diviner.divine([bw, ...cases[0].slice(0, -1)])
          expect(results).toBeArrayOfSize(0)
        })
      })
    })
    describe('with multiple schema transforms', () => {
      const validateMultiResult = async (
        input: [boundWitness: BoundWitness, timestamp: TimeStamp, thumbnail: ImageThumbnail, payload: Payload],
        result: Payload[],
      ) => {
        const [boundWitness, timestamp, thumbnail, payload] = input
        const payloadDictionary = await PayloadBuilder.toDataHashMap([boundWitness, timestamp, thumbnail, payload])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isTemporalIndexingDivinerResultIndex)).toBeArrayOfSize(1)
        const index = result.find(isTemporalIndexingDivinerResultIndex)
        expect(index?.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index?.timestamp).toBe(timestamp.timestamp)
        expect((index as { url?: string })?.url).toBe((payload as { sourceUrl?: string }).sourceUrl)
        expect((index as { status?: number })?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        diviner = await TemporalIndexingDivinerIndexCandidateToIndexDiviner.create({
          account: 'random',
          config: {
            schema: TemporalIndexingDivinerIndexCandidateToIndexDiviner.defaultConfigSchema,
            schemaTransforms,
          },
        })
      })
      const schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary = {
        'network.xyo.image.thumbnail': [{ destinationField: 'status', sourcePathExpression: '$.http.status' }],
        'network.xyo.image.thumbnail.other': [{ destinationField: 'url', sourcePathExpression: '$.sourceUrl' }],
        'network.xyo.timestamp': [{ destinationField: 'timestamp', sourcePathExpression: '$.timestamp' }],
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
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload])).build()
          const result = await diviner.divine([boundWitness, timestamp, thumbnail, payload])
          await validateMultiResult([boundWitness, timestamp, thumbnail, payload], result)
        })
        it.each(cases)('handles sparse inputs', async (thumbnail, timestamp, payload) => {
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload])).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
        })
      })
      describe('with multiple results', () => {
        it('transforms multiple results', async () => {
          const data: [BoundWitness, TimeStamp, ImageThumbnail, Payload][] = await Promise.all(
            cases.map(async (payloads) => {
              const [bw] = await (await new BoundWitnessBuilder().payloads(payloads)).build()
              return [bw, ...payloads]
            }),
          )
          const results = await diviner.divine(data.flat())
          expect(results).toBeArrayOfSize(cases.length)
          // eslint-disable-next-line unicorn/no-array-for-each
          await Promise.all(
            data.map(async (input, i) => {
              const result = results[i]
              await validateMultiResult(input, [result])
            }),
          )
        })
        it('handles sparse inputs', async () => {
          const [bw] = await (await new BoundWitnessBuilder().payloads(cases[0])).build()
          const results = await diviner.divine([bw, ...cases.flat()])
          expect(results).toBeArrayOfSize(1)
          await validateMultiResult([bw, ...cases[0]], results)
        })
        it('handles missing inputs', async () => {
          const [bw] = await (await new BoundWitnessBuilder().payloads([...cases[0]])).build()
          const results = await diviner.divine([bw, ...cases[0].slice(0, -1)])
          expect(results).toBeArrayOfSize(0)
        })
      })
    })
  })
})
