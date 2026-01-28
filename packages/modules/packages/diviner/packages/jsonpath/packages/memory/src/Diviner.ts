import { assertEx } from '@xylabs/sdk-js'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { JsonPathDivinerParams, PayloadTransformer } from '@xyo-network/diviner-jsonpath-model'
import { JsonPathDivinerConfigSchema } from '@xyo-network/diviner-jsonpath-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload,
  Schema, WithoutSchema,
} from '@xyo-network/payload-model'
import { PayloadSchema } from '@xyo-network/payload-model'

import { toPayloadTransformer } from './jsonpath/index.ts'

export class JsonPathDiviner<
  TParams extends JsonPathDivinerParams = JsonPathDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, JsonPathDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = JsonPathDivinerConfigSchema

  protected _transforms: PayloadTransformer[] | undefined

  /**
   * The schema to use for the destination payloads
   */
  protected get destinationSchema(): Schema {
    return this.config.destinationSchema ?? PayloadSchema
  }

  /**
   * Dictionary of schemas to payload transformers for creating indexes
   * from the payloads within a Bound Witness
   */
  protected get transforms(): PayloadTransformer[] {
    if (!this._transforms) {
      const transforms = assertEx(this.config.transforms, () => 'config.transforms is not defined')
      this._transforms = transforms.map(toPayloadTransformer)
    }
    return this._transforms
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    if (!payloads) return []
    // Create the indexes from the tuples
    return await Promise.all(
      payloads.map<Promise<TOut>>(async (payload) => {
        // Use the payload transformers to convert the fields from the source payloads to the destination fields
        const fields = this.transforms.map(transform => transform(payload)) as WithoutSchema<TOut>[]
        // Include all the sources for reference
        const sources = await PayloadBuilder.dataHashes([payload])
        // Build and return the index
        return new PayloadBuilder<TOut>({ schema: this.destinationSchema }).fields(Object.assign({ sources }, ...fields)).build()
      }),
    )
  }
}
