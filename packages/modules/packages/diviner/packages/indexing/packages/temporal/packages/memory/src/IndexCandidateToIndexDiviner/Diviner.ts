import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { jsonPathToTransformersDictionary } from '@xyo-network/diviner-jsonpath-aggregate-memory'
import { SchemaToJsonPathTransformExpressionsDictionary, SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-jsonpath-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema,
  TemporalIndexingDivinerIndexCandidateToIndexDivinerParams,
  TemporalIndexingDivinerResultIndex,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields } from '@xyo-network/payload-model'
import { intraBoundwitnessSchemaCombinations } from '@xyo-network/payload-utils'

type IndexableHashes = [string, ...string[]]

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
    // If the Bound Witness does not contain all the required schemas do not index it
    const indexableBoundWitnesses: BoundWitness[] = payloads
      .filter(isBoundWitness)
      .filter((bw) => containsAll(bw.payload_schemas, this.indexableSchemas))
    // If the Payload is not one of the indexable schemas do not index it
    const indexablePayloads: Payload[] = payloads.filter((p) => this.isIndexablePayload(p))
    // If there is nothing to index, return an empty array
    if (indexableBoundWitnesses.length === 0 || indexablePayloads.length === 0) return []
    // Hash all the indexable data once
    const [bwDictionary, payloadDictionary] = await Promise.all([
      PayloadBuilder.toDataHashMap(indexableBoundWitnesses),
      PayloadBuilder.toDataHashMap(indexablePayloads),
    ])
    // eslint-disable-next-line unicorn/no-array-reduce
    const validIndexableTuples: IndexableHashes[] = Object.entries(bwDictionary).reduce<IndexableHashes[]>((indexableTuples, [bwHash, bw]) => {
      // Find the combinations of payloads that satisfy the required schemas
      intraBoundwitnessSchemaCombinations(bw, this.indexableSchemas).map((combination) => {
        const indexablePayloads = combination.map((hash) => payloadDictionary[hash]).filter(exists)
        // If we found a timestamp and the right amount of indexable payloads (of the
        // correct schema as checked above) in this BW, then index it
        if (indexablePayloads.length === this.indexableSchemas.length) indexableTuples.push([bwHash, ...combination])
      })
      return indexableTuples
    }, [])
    // Create the indexes from the tuples
    const indexes = await Promise.all(
      validIndexableTuples.map<Promise<TemporalIndexingDivinerResultIndex>>(async ([bwHash, ...sourcePayloadHashes]) => {
        const sourcePayloads = sourcePayloadHashes.map((hash) => payloadDictionary[hash])
        // Use the payload transformers to convert the fields from the source payloads to the destination fields
        const indexFields = sourcePayloads.flatMap<PayloadFields[]>((payload) => {
          // Find the transformers for this payload
          const transformers = this.payloadTransformers[payload.schema]
          // If transformers exist, apply them to the payload otherwise return an empty array
          return transformers ? transformers.map((transform) => transform(payload)) : []
        })
        // Include all the sources for reference
        const sources: string[] = [bwHash, ...sourcePayloadHashes]
        // Build and return the index
        return await new PayloadBuilder<TemporalIndexingDivinerResultIndex>({ schema: TemporalIndexingDivinerResultIndexSchema })
          .fields(Object.assign({ sources }, ...indexFields))
          .build()
      }),
    )
    return indexes.flat()
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
