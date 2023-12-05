import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { JsonPathDivinerConfigSchema, JsonPathDivinerParams, PayloadTransformer } from '@xyo-network/diviner-jsonpath-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields, PayloadSchema } from '@xyo-network/payload-model'

import { toPayloadTransformer } from './jsonpath'

export class JsonPathDiviner<
  TParams extends JsonPathDivinerParams = JsonPathDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [JsonPathDivinerConfigSchema]

  protected _transforms: PayloadTransformer[] | undefined

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
  protected get transforms(): PayloadTransformer[] {
    if (!this._transforms) {
      const transforms = assertEx(this.config.transforms, 'config.transforms is not defined')
      this._transforms = transforms.map(toPayloadTransformer)
    }
    return this._transforms
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    if (!payloads) return []
    // Create the indexes from the tuples
    const results = await Promise.all(
      payloads.map<Promise<TOut>>(async (payload) => {
        // Use the payload transformers to convert the fields from the source payloads to the destination fields
        const indexFields: PayloadFields[] = this.transforms.map((transform) => transform(payload))
        // Include all the sources for reference
        const sources = Object.keys(await PayloadHasher.toMap([payload]))
        // Build and return the index
        return new PayloadBuilder<TOut>({ schema: this.destinationSchema }).fields(Object.assign({ sources }, ...indexFields)).build()
      }),
    )
    return results
  }
}
