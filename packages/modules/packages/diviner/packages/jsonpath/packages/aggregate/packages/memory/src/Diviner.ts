import { assertEx } from '@xylabs/assert'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import {
  JsonPathAggregateDivinerConfigSchema,
  JsonPathAggregateDivinerParams,
  PayloadTransformer,
  SchemaToJsonPathTransformExpressionsDictionary,
  SchemaToPayloadTransformersDictionary,
} from '@xyo-network/diviner-jsonpath-aggregate-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload, PayloadSchema, WithOptionalMeta } from '@xyo-network/payload-model'
import { combinationsByBoundwitness, combinationsBySchema } from '@xyo-network/payload-utils'

import { jsonPathToTransformersDictionary, reducePayloads } from './jsonpath'

const moduleName = 'JsonPathAggregateDiviner'

export class JsonPathAggregateDiviner<
  TParams extends JsonPathAggregateDivinerParams = JsonPathAggregateDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams['config'], TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams['config'], TIn, TOut>,
    TIn,
    TOut
  >,
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
    if (!this._transformableSchemas) this._transformableSchemas = Object.keys(this.schemaTransforms)
    return this._transformableSchemas
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    if (!payloads) return []
    const strippedPayloads = payloads.map((payload) => {
      const p = { ...payload } as WithOptionalMeta<TIn>
      delete p.$hash
      delete p.$meta
      return p as TIn
    })
    const combinations =
      this.transformableSchemas.includes(BoundWitnessSchema) ?
        await combinationsByBoundwitness(strippedPayloads)
      : await combinationsBySchema(strippedPayloads, this.transformableSchemas)
    const reducedPayloads = await Promise.all(
      combinations.map((combination) => {
        return reducePayloads<TOut>(combination, this.payloadTransformers, this.destinationSchema, this.config.excludeSources ?? false)
      }),
    )
    return reducedPayloads
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
    return typeof schema === 'string' ? this.transformableSchemas.includes(schema) : false
  }
}
