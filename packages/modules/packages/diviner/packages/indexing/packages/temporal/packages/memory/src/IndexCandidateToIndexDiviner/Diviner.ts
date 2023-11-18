import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { TemporalIndexingDivinerResultIndexSchema } from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'
import jsonpath from 'jsonpath'

import { PayloadTransformer, StringToJsonPathTransformExpressionsDictionary, StringToPayloadTransformersDictionary } from '../lib'
import { TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema } from './Config'
import { TemporalIndexCandidateToIndexDivinerParams } from './Params'

export type IndexablePayloads = [BoundWitness, TimeStamp, ...Payload[]]

const moduleName = 'TemporalIndexingDivinerIndexCandidateToIndexDiviner'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class TemporalIndexingDivinerIndexCandidateToIndexDiviner<
  TParams extends TemporalIndexCandidateToIndexDivinerParams = TemporalIndexCandidateToIndexDivinerParams,
> extends AbstractDiviner<TParams, Payload, Payload> {
  static override configSchema = TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexCandidateToIndexDiviner',
  }

  private _indexableSchemas: string[] | undefined
  private _schemaToPayloadTransformersDictionary: StringToPayloadTransformersDictionary | undefined

  /**
   * List of indexable schemas for this diviner
   */
  protected get indexableSchemas() {
    // Return the computed result if we've calculated it before as the config
    // shouldn't change after initialization
    if (this._indexableSchemas) return this._indexableSchemas
    this._indexableSchemas = [...Object.keys(this.schemaTransforms)]
    return this._indexableSchemas
  }

  /**
   * Dictionary of schemas to payload transformers for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get schemaToPayloadTransformersDictionary(): StringToPayloadTransformersDictionary {
    // Return the computed result if we've calculated it before as the config
    // shouldn't change after initialization
    if (this._schemaToPayloadTransformersDictionary) return this._schemaToPayloadTransformersDictionary
    this._schemaToPayloadTransformersDictionary = Object.fromEntries(
      Object.entries(this.schemaTransforms).map(([schema, jsonPathTransformerExpressions]) => {
        const transformers = jsonPathTransformerExpressions.map((transformExpression) => {
          const { sourcePathExpression, destinationField } = transformExpression
          const transformer: PayloadTransformer = (x: Payload) => {
            // eslint-disable-next-line import/no-named-as-default-member
            const source = jsonpath.value(x, sourcePathExpression)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transformed = {} as { [key: string]: any }
            transformed[destinationField] = source
            return transformed
          }
          return transformer
        })
        return [schema, transformers]
      }),
    )
    return this._schemaToPayloadTransformersDictionary
  }

  /**
   * The dictionary of schemas to JSON Path transform expressions for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get schemaTransforms(): StringToJsonPathTransformExpressionsDictionary {
    return assertEx(this.config?.schemaTransforms, () => `${moduleName}: Missing config.schemaTransforms section`)
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const bws: BoundWitness[] = payloads.filter(isBoundWitness)
    const timestampPayloads: TimeStamp[] = payloads.filter(isTimestamp)
    const indexablePayloads: Payload[] = payloads.filter((p) => this.isIndexablePayload(p))
    if (bws.length && timestampPayloads.length && indexablePayloads.length) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      const validIndexableTuples: IndexablePayloads[] = bws.reduce<IndexablePayloads[]>((indexableTuples, bw) => {
        // If this Bound Witness doesn't contain all the required schemas don't index it
        if (!containsAll(bw.payload_schemas, this.indexableSchemas)) return indexableTuples
        // Find the timestamp
        const timestampPosition = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
        const timestampHash = bw.payload_hashes?.[timestampPosition]
        const timestamp = [payloadDictionary[timestampHash]].find(isTimestamp)
        // Find the remaining indexable payloads
        const indexablePayloadPositions = this.indexableSchemas.map((schema) => bw.payload_schemas.indexOf(schema))
        const indexablePayloadHashes = indexablePayloadPositions.map((index) => bw.payload_hashes?.[index])
        const indexablePayloads = indexablePayloadHashes.map((hash) => payloadDictionary[hash]).filter(exists)
        // If we found a timestamp and the right amount of indexable payloads (of the
        // correct schema as checked above) in this BW, then index it
        if (timestamp && indexablePayloads.length === this.indexableSchemas.length) indexableTuples.push([bw, timestamp, ...indexablePayloads])
        return indexableTuples
      }, [])
      // Create the indexes from the tuples
      const indexes = await Promise.all(
        validIndexableTuples.map(async ([bw, timestampPayload, ...remainingPayloads]) => {
          const partials = remainingPayloads
            .map((payload) => {
              const transforms = this.schemaToPayloadTransformersDictionary[payload.schema]
              const transformed: Partial<Payload>[] = transforms.map((transform) => transform(payload))
              return transformed
            })
            .flat()
          const transformed = Object.assign({}, ...partials, { schema: TemporalIndexingDivinerResultIndexSchema })
          const { timestamp } = timestampPayload
          const sources = (await PayloadHasher.hashPairs([bw, timestampPayload, ...remainingPayloads])).map(([, hash]) => hash)
          return [{ ...transformed, sources, timestamp }]
        }),
      )
      return indexes.flat()
    }
    return Promise.resolve([])
  }

  /**
   * Identifies if a payload is one that is indexed by this diviner
   * @param x The candidate payload
   * @returns True if the payload is one indexed by this diviner, false otherwise
   */
  protected isIndexablePayload = (x: Payload) => {
    return this.indexableSchemas.includes(x?.schema)
  }

  /**
   * Identifies if a schema is one that is indexed by this diviner
   * @param schema The candidate schema
   * @returns True if this schema is one indexed by this diviner, false otherwise
   */
  protected isIndexableSchema = (schema?: string | null) => {
    return this.indexableSchemas.some((s) => s === schema)
  }
}
