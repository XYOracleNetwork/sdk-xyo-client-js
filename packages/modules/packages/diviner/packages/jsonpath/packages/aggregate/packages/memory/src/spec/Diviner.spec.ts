/* eslint-disable sonarjs/no-duplicate-string */
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-aggregate-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { JsonPathAggregateDiviner } from '../Diviner.js'

function countCombinations<T>(jaggedArray: T[][]): number {
  return jaggedArray.reduce((total, currentArray) => total * currentArray.length, 1)
}

type ImageThumbnail = Payload<{
  http?: {
    ipAddress?: string
    status?: number
  }
  // schema: 'network.xyo.image.thumbnail'
  sourceUrl: string
  url?: string
}>
type TimeStamp = Payload<{ timestamp: number }>
type ResultType = Payload<{ sources: string[]; status?: number; timestamp: number; url?: string }>

describe('JsonPathAggregateDiviner', () => {
  describe('divine', () => {
    const destinationSchema = 'network.xyo.test'
    const timestampA = 1_234_567_890
    const timestampPayloadA = { schema: 'network.xyo.timestamp', timestamp: timestampA }
    const imageThumbnailPayloadA: ImageThumbnail = {
      http: {
        status: 200,
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://node.xyo.network',
      url: 'data',
    }
    const timestampB = 1_234_567_891
    const timestampPayloadB = { schema: 'network.xyo.timestamp', timestamp: timestampB }
    const imageThumbnailPayloadB: ImageThumbnail = {
      http: {
        status: 500,
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://www.google.com',
    }
    const timestampC = 1_234_567_892
    const timestampPayloadC = { schema: 'network.xyo.timestamp', timestamp: timestampC }
    const imageThumbnailPayloadC: ImageThumbnail = {
      http: {
        ipAddress: '192.169.1.1',
      },
      schema: 'network.xyo.image.thumbnail',
      sourceUrl: 'https://explore.xyo.network',
    }
    let account: AccountInstance
    beforeAll(async () => {
      account = await Account.random()
    })
    describe('with only payload schema transforms', () => {
      const validatePayloadResult = async (input: [timestamp: TimeStamp, thumbnail: ImageThumbnail, payload: Payload], result: Payload[]) => {
        const [timestamp, thumbnail, payload] = input
        const payloadDictionary = await PayloadBuilder.toDataHashMap([timestamp, thumbnail, payload])
        expect(result).toBeArrayOfSize(1)
        expect(result.filter(isPayloadOfSchemaType(destinationSchema))).toBeArrayOfSize(1)
        const index = result.find(isPayloadOfSchemaType<ResultType>(destinationSchema))
        expect(index?.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index?.timestamp).toBe(timestamp.timestamp)
        expect(index?.url).toBe((payload as { sourceUrl?: string }).sourceUrl)
        expect(index?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        const config = { destinationSchema, schema: JsonPathAggregateDiviner.defaultConfigSchema, schemaTransforms }
        diviner = await JsonPathAggregateDiviner.create({ account, config })
      })
      const schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary = {
        'network.xyo.image.thumbnail': [{ destinationField: 'status', sourcePathExpression: '$.http.status' }],
        'network.xyo.image.thumbnail.other': [{ destinationField: 'url', sourcePathExpression: '$.sourceUrl' }],
        'network.xyo.timestamp': [{ destinationField: 'timestamp', sourcePathExpression: '$.timestamp' }],
      }
      let diviner: JsonPathAggregateDiviner

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
      describe('with single input', () => {
        it.each(cases)('transforms single input', async (timestamp, thumbnail, payload) => {
          const result = await diviner.divine([timestamp, thumbnail, payload])
          await validatePayloadResult([timestamp, thumbnail, payload], result)
        })
      })
      describe('with multiple inputs', () => {
        it('transforms to multiple outputs', async () => {
          const results = await diviner.divine(cases.flat())
          expect(results).toBeArrayOfSize(countCombinations(cases))
          let resultIndex = 0
          for (let i = 0; i < cases.length; i++) {
            const thumbnail = cases[i][1]
            for (let j = 0; j < cases.length; j++) {
              const payload = cases[j][2]
              // eslint-disable-next-line unicorn/no-for-loop
              for (let k = 0; k < cases.length; k++) {
                const timestamp = cases[k][0]
                const result = results[resultIndex]
                await validatePayloadResult([timestamp, thumbnail, payload], [result])
                resultIndex++
              }
            }
          }
        })
      })
      describe('with sparse input', () => {
        it.each(cases)('returns empty array', async (thumbnail, timestamp, payload) => {
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload])).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
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
        expect(result.filter(isPayloadOfSchemaType(destinationSchema))).toBeArrayOfSize(1)
        const index = result.find(isPayloadOfSchemaType<ResultType>(destinationSchema))
        expect(index?.sources.sort()).toEqual(Object.keys(payloadDictionary).sort())
        expect(index?.timestamp).toBe(timestamp.timestamp)
        expect(index?.url).toBe((payload as { sourceUrl?: string }).sourceUrl)
        expect(index?.status).toBe(thumbnail.http?.status)
      }
      beforeAll(async () => {
        const config = { destinationSchema, schema: JsonPathAggregateDiviner.defaultConfigSchema, schemaTransforms }
        diviner = await JsonPathAggregateDiviner.create({ account, config })
      })
      const schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary = {
        'network.xyo.boundwitness': [],
        'network.xyo.image.thumbnail': [{ destinationField: 'status', sourcePathExpression: '$.http.status' }],
        'network.xyo.image.thumbnail.other': [{ destinationField: 'url', sourcePathExpression: '$.sourceUrl' }],
        'network.xyo.timestamp': [{ destinationField: 'timestamp', sourcePathExpression: '$.timestamp' }],
      }
      let diviner: JsonPathAggregateDiviner

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
      describe('with single input', () => {
        it.each(cases)('transforms single input', async (timestamp, thumbnail, payload) => {
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload])).build()
          const result = await diviner.divine([boundWitness, timestamp, thumbnail, payload])
          await validateMultiResult([boundWitness, timestamp, thumbnail, payload], result)
        })
      })
      describe('with multiple inputs', () => {
        it('transforms to multiple outputs', async () => {
          const bws = await Promise.all(cases.map(async (c) => (await new BoundWitnessBuilder().payloads(c)).build()))
          const allCases = bws.map((bw, i) => [bw[0], ...cases[i]] as [BoundWitness, TimeStamp, ImageThumbnail, Payload])
          const results = await diviner.divine(allCases.flat())
          expect(results).toBeArrayOfSize(cases.length)
          for (const [i, c] of allCases.entries()) {
            const [boundWitness, timestamp, thumbnail, payload] = c
            await validateMultiResult([boundWitness, timestamp, thumbnail, payload], [results[i]])
          }
        })
      })
      describe('with sparse input', () => {
        it.each(cases)('returns empty array', async (thumbnail, timestamp, payload) => {
          const [boundWitness] = await (await new BoundWitnessBuilder().payloads([timestamp, thumbnail, payload])).build()
          expect(await diviner.divine([thumbnail, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, timestamp])).toBeArrayOfSize(0)
          expect(await diviner.divine([boundWitness, thumbnail])).toBeArrayOfSize(0)
        })
      })
    })
  })
})
