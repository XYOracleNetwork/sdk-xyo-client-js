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
import { Payload, PayloadSchema } from '@xyo-network/payload-model'

import { jsonPathToTransformersDictionary, reducePayloads } from './jsonpath'

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
   * Dictionary of schemas to payload transformers
   */
  protected get payloadTransformers(): SchemaToPayloadTransformersDictionary {
    if (!this._payloadTransformers) this._payloadTransformers = jsonPathToTransformersDictionary(this.schemaTransforms)
    return this._payloadTransformers
  }

  /**
   * The dictionary of schemas to JSON Path transform expressions
   */
  protected get schemaTransforms(): SchemaToJsonPathTransformExpressionsDictionary {
    return assertEx(this.config?.schemaTransforms, () => `${moduleName}: Missing config.schemaTransforms section`)
  }

  /**
   * List of transformable schemas for this diviner
   */
  protected get transformableSchemas(): string[] {
    if (!this._transformableSchemas) this._transformableSchemas = [...Object.keys(this.schemaTransforms)]
    return this._transformableSchemas
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    if (!payloads) return []
    const reducedPayloads = await reducePayloads<TOut>(payloads, this.payloadTransformers, this.destinationSchema)
    return [reducedPayloads]
  }

  /**
   * Identifies if a payload is one that is transformed by this diviner
   * @param x The candidate payload
   * @returns True if the payload is one transformed by this diviner, false otherwise
   */
  protected isTransformablePayload = (x: Payload) => {
    return this.transformableSchemas.includes(x?.schema)
  }

  /**
   * Identifies if a schema is one that is transformed by this diviner
   * @param schema The candidate schema
   * @returns True if this schema is one transformed by this diviner, false otherwise
   */
  protected isTransformableSchema = (schema?: string | null) => {
    return this.transformableSchemas.some((s) => s === schema)
  }
}
