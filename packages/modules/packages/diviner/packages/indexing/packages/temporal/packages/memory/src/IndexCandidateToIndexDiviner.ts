import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { ImageThumbnail, ImageThumbnailResultIndexSchema, ImageThumbnailSchema, isImageThumbnail } from '@xyo-network/image-thumbnail-payload-plugin'
import { Labels } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'
import jsonpath from 'jsonpath'

import { PayloadTransformer, StringToJsonPathTransformExpressionsDictionary } from './lib'

const schemaToJsonPathExpression: StringToJsonPathTransformExpressionsDictionary = {
  'network.xyo.image.thumbnail': [
    { destinationField: 'url', sourcePathExpression: '$.sourceUrl' },
    { destinationField: 'status', sourcePathExpression: '$.http.status' },
  ],
}

const schemaToPayloadTransformersDictionary: { [key: keyof typeof schemaToJsonPathExpression]: PayloadTransformer[] } = Object.fromEntries(
  Object.entries(schemaToJsonPathExpression).map(([key, v]) => {
    const transformers = v.map((t) => {
      const { sourcePathExpression, destinationField: targetField } = t
      const transformer: PayloadTransformer = (x: Payload) => {
        // eslint-disable-next-line import/no-named-as-default-member
        const source = jsonpath.value(x, sourcePathExpression)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformed = {} as { [key: string]: any }
        transformed[targetField] = source
        return transformed
      }
      return transformer
    })
    return [key, transformers]
  }),
)

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class TemporalIndexingDivinerIndexCandidateToIndexDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexCandidateToIndexDiviner',
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const bws: BoundWitness[] = payloads.filter(isBoundWitness)
    const imageThumbnailPayloads: ImageThumbnail[] = payloads.filter(isImageThumbnail)
    const timestampPayloads: TimeStamp[] = payloads.filter(isTimestamp)
    if (bws.length && imageThumbnailPayloads.length && timestampPayloads.length) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      const tuples: [BoundWitness, ImageThumbnail, TimeStamp][] = bws.reduce<[BoundWitness, ImageThumbnail, TimeStamp][]>(
        (acc, curr) => {
          const imageThumbnailIndex = curr.payload_schemas?.findIndex((schema) => schema === ImageThumbnailSchema)
          const timestampIndex = curr.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
          const imageThumbnailHash = curr.payload_hashes?.[imageThumbnailIndex]
          const timestampHash = curr.payload_hashes?.[timestampIndex]
          const imageThumbnailPayload = [payloadDictionary[imageThumbnailHash]].find(isImageThumbnail)
          const timestampPayload = [payloadDictionary[timestampHash]].find(isTimestamp)
          if (imageThumbnailPayload && timestampPayload) acc.push([curr, imageThumbnailPayload, timestampPayload])
          return acc
        },
        [] as [BoundWitness, ImageThumbnail, TimeStamp][],
      )
      const indexes = await Promise.all(
        tuples.map(async ([bw, imageThumbnailPayload, timestampPayload]) => {
          const partials = Object.keys(schemaToPayloadTransformersDictionary)
            .map((key) => {
              return schemaToPayloadTransformersDictionary[key].map((transformer) => {
                return transformer(imageThumbnailPayload)
              })
            })
            .flat()
          const transformed = Object.assign({}, ...partials, { schema: ImageThumbnailResultIndexSchema })
          const { timestamp } = timestampPayload
          const sources = (await PayloadHasher.hashPairs([bw, transformed, timestampPayload])).map(([, hash]) => hash)
          return [{ ...transformed, sources, timestamp }]
        }),
      )
      return indexes.flat()
    }
    return Promise.resolve([])
  }
}
