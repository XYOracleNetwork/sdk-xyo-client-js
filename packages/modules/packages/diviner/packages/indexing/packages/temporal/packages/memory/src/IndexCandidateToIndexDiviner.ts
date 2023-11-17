import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { ImageThumbnailResultIndexSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { Labels } from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'
import jsonpath from 'jsonpath'

import { PayloadTransformer, StringToJsonPathTransformExpressionsDictionary } from './lib'

const schemaToJsonPathExpression: StringToJsonPathTransformExpressionsDictionary = {
  'network.xyo.image.thumbnail': [
    { destinationField: 'url', sourcePathExpression: '$.sourceUrl' },
    { destinationField: 'status', sourcePathExpression: '$.http.status' },
  ],
}

type IndexablePayloads = [BoundWitness, TimeStamp, ...Payload[]]

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

const isIndexableSchema = (schema?: string | null) => {
  return Object.keys(schemaToJsonPathExpression).some((s) => s === schema)
}

const isIndexablePayload = (x?: Payload | null) => {
  return Object.keys(schemaToJsonPathExpression)
    .map((schema) => isPayloadOfSchemaType(schema))
    .map((validator) => validator(x))
    .some((x) => x)
}

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
    const timestampPayloads: TimeStamp[] = payloads.filter(isTimestamp)
    const indexablePayloads: Payload[] = payloads.filter(isIndexablePayload)
    if (bws.length && timestampPayloads.length && indexablePayloads.length) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      const tuples: IndexablePayloads[] = bws.reduce<IndexablePayloads[]>((acc, bw) => {
        const timestampPosition = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
        const timestampHash = bw.payload_hashes?.[timestampPosition]
        const timestamp = [payloadDictionary[timestampHash]].find(isTimestamp)
        const indexablePayloadPositions = bw.payload_schemas?.reduce((acc, curr, index) => {
          if (isIndexableSchema(curr)) acc.push(index)
          return acc
        }, [] as number[])
        const indexablePayloadHashes = indexablePayloadPositions.map((index) => bw.payload_hashes?.[index])
        const indexablePayloads = indexablePayloadHashes.map((hash) => payloadDictionary[hash])
        if (timestamp && indexablePayloads.length) acc.push([bw, timestamp, ...indexablePayloads])
        return acc
      }, [] as IndexablePayloads[])
      const indexes = await Promise.all(
        tuples.map(async ([bw, timestampPayload, remainingPayloads]) => {
          const partials = Object.keys(schemaToPayloadTransformersDictionary)
            .map((key) => {
              return schemaToPayloadTransformersDictionary[key].map((transformer) => {
                return transformer(remainingPayloads)
              })
            })
            .flat()
          const transformed = Object.assign({}, ...partials, { schema: ImageThumbnailResultIndexSchema })
          const { timestamp } = timestampPayload
          const sources = (await PayloadHasher.hashPairs([bw, timestampPayload, remainingPayloads])).map(([, hash]) => hash)
          return [{ ...transformed, sources, timestamp }]
        }),
      )
      return indexes.flat()
    }
    return Promise.resolve([])
  }
}
