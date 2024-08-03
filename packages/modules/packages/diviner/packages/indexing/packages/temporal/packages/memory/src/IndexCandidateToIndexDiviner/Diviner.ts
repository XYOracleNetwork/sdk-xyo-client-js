import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { BoundWitness, isBoundWitnessWithMeta } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { jsonPathToTransformersDictionary } from '@xyo-network/diviner-jsonpath-aggregate-memory'
import { SchemaToJsonPathTransformExpressionsDictionary, SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-jsonpath-model'
import {
  TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema,
  TemporalIndexingDivinerIndexCandidateToIndexDivinerParams,
  TemporalIndexingDivinerResultIndex,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isAnyPayload, Payload, Schema } from '@xyo-network/payload-model'
import { intraBoundwitnessSchemaCombinations } from '@xyo-network/payload-utils'

type IndexableHashes = [Hash, ...Hash[]]

const moduleName = 'TemporalIndexingDivinerIndexCandidateToIndexDiviner'

/**
 * Diviner which transforms index candidates to indexes using JSON Path to map
 * source properties in the supplied payloads to destination fields in the
 * resultant index
 */
export class TemporalIndexingDivinerIndexCandidateToIndexDiviner<
  TParams extends TemporalIndexingDivinerIndexCandidateToIndexDivinerParams = TemporalIndexingDivinerIndexCandidateToIndexDivinerParams,
> extends AbstractDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = TemporalIndexingDivinerIndexCandidateToIndexDivinerConfigSchema
  static override labels: Labels = {
    ...super.labels,
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
    const builtPayloads = await Promise.all(payloads.map(payload => PayloadBuilder.build(payload)))
    // If the Bound Witness does not contain all the required schemas do not index it
    const indexableBoundWitnesses = builtPayloads
      .filter(isBoundWitnessWithMeta)
      .filter(bw => containsAll(bw.payload_schemas, this.indexableSchemas))
    // If the Payload is not one of the indexable schemas do not index it
    const indexablePayloads = builtPayloads.filter(p => this.isIndexablePayload(p))
    // If there is nothing to index, return an empty array
    if (indexableBoundWitnesses.length === 0 || indexablePayloads.length === 0) return []
    // Hash all the indexable data once
    const [bwDictionary, payloadDictionary] = await Promise.all([
      PayloadBuilder.toDataHashMap(indexableBoundWitnesses),
      PayloadBuilder.toDataHashMap(indexablePayloads),
    ])

    // Initialize the array for validIndexableTuples outside of the loop
    const validIndexableTuples: IndexableHashes[] = []

    // Iterate over each entry in bwDictionary
    for (const [bwHash, bw] of Object.entries(bwDictionary) as [Hash, BoundWitness][]) {
      // Find the combinations of payloads that satisfy the required schemas
      const combinations = intraBoundwitnessSchemaCombinations(bw, this.indexableSchemas)

      // Iterate over each combination
      for (const combination of combinations) {
        const indexablePayloads = combination.map(hash => payloadDictionary[hash]).filter(exists)

        // If we found the right amount of indexable payloads (of the correct schema as checked
        // above) in this BW, then index it
        if (indexablePayloads.length === this.indexableSchemas.length) {
          validIndexableTuples.push([bwHash, ...combination])
        }
      }
    }

    // Create the indexes from the tuples
    const indexes = await Promise.all(
      validIndexableTuples.map<Promise<TemporalIndexingDivinerResultIndex>>(async ([bwHash, ...sourcePayloadHashes]) => {
        const sourcePayloads = sourcePayloadHashes.map(hash => payloadDictionary[hash])
        // Use the payload transformers to convert the fields from the source payloads to the destination fields
        const indexFields = sourcePayloads.flatMap((payload) => {
          // Find the transformers for this payload
          const transformers = this.payloadTransformers[payload.schema]
          // If transformers exist, apply them to the payload otherwise return an empty array
          return transformers ? transformers.map(transform => transform(payload)) : []
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
  protected isIndexablePayload = (x: unknown) => {
    return isAnyPayload(x) && this.indexableSchemas.includes(x?.schema)
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
