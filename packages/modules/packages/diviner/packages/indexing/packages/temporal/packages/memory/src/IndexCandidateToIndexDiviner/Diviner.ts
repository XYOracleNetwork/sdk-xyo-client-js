import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { jsonPathToTransformersDictionary } from '@xyo-network/diviner-jsonpath-aggregate-memory'
import { SchemaToJsonPathTransformExpressionsDictionary, SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-jsonpath-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema,
  TemporalIndexingDivinerIndexCandidateToIndexDivinerParams,
  TemporalIndexingDivinerResultIndex,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { PayloadHasher } from '@xyo-network/hash'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields } from '@xyo-network/payload-model'

export type IndexablePayloads = [BoundWitness, ...Payload[]]

const moduleName = 'TemporalIndexingDivinerIndexCandidateToIndexDiviner'

/**
 * Diviner which transforms index candidates to indexes using JSON Path to map
 * source properties in the supplied payloads to destination fields in the
 * resultant index
 */
export class TemporalIndexingDivinerIndexCandidateToIndexDiviner<
  TParams extends TemporalIndexingDivinerIndexCandidateToIndexDivinerParams = TemporalIndexingDivinerIndexCandidateToIndexDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchema = TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexCandidateToIndexDiviner',
  }

  private _indexableSchemas: string[] | undefined
  private _payloadTransformers: SchemaToPayloadTransformersDictionary | undefined

  /**
   * List of indexable schemas for this diviner
   */
  protected get indexableSchemas(): string[] {
    if (!this._indexableSchemas) this._indexableSchemas = Object.keys(this.schemaTransforms)
    return this._indexableSchemas
  }

  /**
   * Dictionary of schemas to payload transformers for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get payloadTransformers(): SchemaToPayloadTransformersDictionary {
    if (!this._payloadTransformers) this._payloadTransformers = jsonPathToTransformersDictionary(this.schemaTransforms)
    return this._payloadTransformers
  }

  /**
   * The dictionary of schemas to JSON Path transform expressions for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get schemaTransforms(): SchemaToJsonPathTransformExpressionsDictionary {
    return assertEx(this.config?.schemaTransforms, () => `${moduleName}: Missing config.schemaTransforms section`)
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const bws: BoundWitness[] = payloads.filter(isBoundWitness)
    const indexablePayloads: Payload[] = payloads.filter((p) => this.isIndexablePayload(p))
    if (bws.length > 0 && indexablePayloads.length > 0) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      // eslint-disable-next-line unicorn/no-array-reduce
      const validIndexableTuples: IndexablePayloads[] = bws.reduce<IndexablePayloads[]>((indexableTuples, bw) => {
        // If this Bound Witness doesn't contain all the required schemas don't index it
        if (!containsAll(bw.payload_schemas, this.indexableSchemas)) return indexableTuples
        // Find the remaining indexable payloads
        const indexablePayloadPositions = this.indexableSchemas.map((schema) => bw.payload_schemas.indexOf(schema))
        const indexablePayloadHashes = indexablePayloadPositions.map((index) => bw.payload_hashes?.[index])
        const indexablePayloads = indexablePayloadHashes.map((hash) => payloadDictionary[hash]).filter(exists)
        // If we found a timestamp and the right amount of indexable payloads (of the
        // correct schema as checked above) in this BW, then index it
        if (indexablePayloads.length === this.indexableSchemas.length) indexableTuples.push([bw, ...indexablePayloads])
        return indexableTuples
      }, [])
      // Create the indexes from the tuples
      const indexes = await Promise.all(
        validIndexableTuples.map<Promise<TemporalIndexingDivinerResultIndex>>(async ([bw, ...sourcePayloads]) => {
          // Use the payload transformers to convert the fields from the source payloads to the destination fields
          const indexFields = sourcePayloads.flatMap<PayloadFields[]>((payload) => {
            // Find the transformers for this payload
            const transformers = this.payloadTransformers[payload.schema]
            // If transformers exist, apply them to the payload otherwise return an empty array
            return transformers ? transformers.map((transform) => transform(payload)) : []
          })
          // Include all the sources for reference
          const sources = Object.keys(await PayloadHasher.toMap([bw, ...sourcePayloads]))
          // Build and return the index
          return await new PayloadBuilder<TemporalIndexingDivinerResultIndex>({ schema: TemporalIndexingDivinerResultIndexSchema })
            .fields(Object.assign({ sources }, ...indexFields))
            .build()
        }),
      )
      return indexes.flat()
    }
    return []
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
    return typeof schema === 'string' ? this.indexableSchemas.includes(schema) : false
  }
}
