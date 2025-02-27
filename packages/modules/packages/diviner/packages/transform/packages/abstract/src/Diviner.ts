import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import {
  DivinerInstance, DivinerModuleEventData, DivinerParams,
} from '@xyo-network/diviner-model'
import {
  PayloadTransformer,
  Transform,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
  TransformDivinerSchema,
} from '@xyo-network/diviner-transform-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<
  TParams extends TransformDivinerParams = TransformDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TransformDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = TransformDivinerConfigSchema

  protected override divineHandler(payloads?: TIn[]): TOut[] {
    const transforms: Transform[] = []
    if (this.config.transform) {
      transforms.push({ schema: TransformDivinerSchema, transform: this.config.transform })
    }
    return transforms.flatMap(transform => payloads?.map(this.transformer(transform)) || [])
  }

  protected abstract transformer(transform: Transform): PayloadTransformer<TIn, TOut>
}
