import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  JsonPathAggregateDivinerConfigSchema,
  JsonPathAggregateDivinerParams,
  PayloadTransformer,
  SchemaToJsonPathTransformExpressionsDictionary,
  SchemaToPayloadTransformersDictionary,
} from '@xyo-network/diviner-jsonpath-aggregate-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields, PayloadSchema } from '@xyo-network/payload-model'

import { jsonPathToTransformersDictionary } from './jsonpath'

const moduleName = 'JsonPathAggregateDiviner'

export class JsonPathAggregateDiviner<
  TParams extends JsonPathAggregateDivinerParams = JsonPathAggregateDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [JsonPathAggregateDivinerConfigSchema]

  protected _transforms: PayloadTransformer[] | undefined

  private _payloadTransformers: SchemaToPayloadTransformersDictionary | undefined
  private _transformableSchemas: string[] | undefined

  /**
   * The schema to use for the destination payloads
   */
  protected get destinationSchema(): string {
    return this.config.destinationSchema ?? PayloadSchema
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

  /**
   * List of indexable schemas for this diviner
   */
  protected get transformableSchemas(): string[] {
    if (!this._transformableSchemas) this._transformableSchemas = [...Object.keys(this.schemaTransforms)]
    return this._transformableSchemas
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const indexablePayloads = payloads?.filter((p) => this.isTransformablePayload(p))
    if (indexablePayloads?.length) {
      // Create the indexes from the tuples
      const payloadFields = indexablePayloads.map<PayloadFields>((payload) => {
        // Use the payload transformers to convert the fields from the source payloads to the destination fields
        // Find the transformers for this payload
        const transformers = this.payloadTransformers[payload.schema]
        // If transformers exist, apply them to the payload otherwise return an empty array
        return transformers ? transformers.map((transform) => transform(payload)) : []
      })
      // Include all the sources for reference
      const sources = Object.keys(await PayloadHasher.toMap(indexablePayloads))
      // Build and return the index
      const aggregate = new PayloadBuilder<TOut>({ schema: this.destinationSchema }).fields(Object.assign({ sources }, ...payloadFields)).build()
      return [aggregate]
    }
    return []
  }

  /**
   * Identifies if a payload is one that is indexed by this diviner
   * @param x The candidate payload
   * @returns True if the payload is one indexed by this diviner, false otherwise
   */
  protected isTransformablePayload = (x: Payload) => {
    return this.transformableSchemas.includes(x?.schema)
  }

  /**
   * Identifies if a schema is one that is indexed by this diviner
   * @param schema The candidate schema
   * @returns True if this schema is one indexed by this diviner, false otherwise
   */
  protected isTransformableSchema = (schema?: string | null) => {
    return this.transformableSchemas.some((s) => s === schema)
  }
}
