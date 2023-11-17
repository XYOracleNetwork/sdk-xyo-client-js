import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { TemporalIndexingDivinerResultIndexSchema } from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'
import jsonpath from 'jsonpath'

import { PayloadTransformer, StringToJsonPathTransformExpressionsDictionary } from '../lib'
import { TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema } from './Config'
import { TemporalIndexCandidateToIndexDivinerParams } from './Params'

// const schemaTransforms: StringToJsonPathTransformExpressionsDictionary = {
//   'network.xyo.image.thumbnail': [
//     { destinationField: 'url', sourcePathExpression: '$.sourceUrl' },
//     { destinationField: 'status', sourcePathExpression: '$.http.status' },
//   ],
// }

export type IndexablePayloads = [BoundWitness, TimeStamp, ...Payload[]]

const moduleName = 'TemporalIndexingDivinerIndexCandidateToIndexDiviner'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class TemporalIndexingDivinerIndexCandidateToIndexDiviner<
  TParams extends TemporalIndexCandidateToIndexDivinerParams = TemporalIndexCandidateToIndexDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchema = TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexCandidateToIndexDiviner',
  }

  protected get schemaToPayloadTransformersDictionary(): { [key: string]: PayloadTransformer[] } {
    return Object.fromEntries(
      Object.entries(this.schemaTransforms).map(([key, v]) => {
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
  }

  protected get schemaTransforms(): StringToJsonPathTransformExpressionsDictionary {
    return assertEx(this.config?.schemaTransforms, () => `${moduleName}: Missing config.schemaTransforms section`)
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const bws: BoundWitness[] = payloads.filter(isBoundWitness)
    const timestampPayloads: TimeStamp[] = payloads.filter(isTimestamp)
    const indexablePayloads: Payload[] = payloads.filter(this.isIndexablePayload)
    if (bws.length && timestampPayloads.length && indexablePayloads.length) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      const tuples: IndexablePayloads[] = bws.reduce<IndexablePayloads[]>((acc, bw) => {
        const timestampPosition = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
        const timestampHash = bw.payload_hashes?.[timestampPosition]
        const timestamp = [payloadDictionary[timestampHash]].find(isTimestamp)
        const indexablePayloadPositions = bw.payload_schemas?.reduce<number[]>((acc, curr, index) => {
          if (this.isIndexableSchema(curr)) acc.push(index)
          return acc
        }, [])
        const indexablePayloadHashes = indexablePayloadPositions.map((index) => bw.payload_hashes?.[index])
        const indexablePayloads = indexablePayloadHashes.map((hash) => payloadDictionary[hash])
        if (timestamp && indexablePayloads.length) acc.push([bw, timestamp, ...indexablePayloads])
        return acc
      }, [])
      const indexes = await Promise.all(
        tuples.map(async ([bw, timestampPayload, remainingPayloads]) => {
          const partials = Object.keys(this.schemaToPayloadTransformersDictionary)
            .map((key) => {
              return this.schemaToPayloadTransformersDictionary[key].map((transformer) => {
                return transformer(remainingPayloads)
              })
            })
            .flat()
          const transformed = Object.assign({}, ...partials, { schema: TemporalIndexingDivinerResultIndexSchema })
          const { timestamp } = timestampPayload
          const sources = (await PayloadHasher.hashPairs([bw, timestampPayload, remainingPayloads])).map(([, hash]) => hash)
          return [{ ...transformed, sources, timestamp }]
        }),
      )
      return indexes.flat()
    }
    return Promise.resolve([])
  }

  protected isIndexablePayload = (x?: Payload | null) => {
    return Object.keys(this.schemaTransforms)
      .map((schema) => isPayloadOfSchemaType(schema))
      .map((validator) => validator(x))
      .some((x) => x)
  }

  protected isIndexableSchema = (schema?: string | null) => {
    return Object.keys(this.schemaTransforms).some((s) => s === schema)
  }
}
