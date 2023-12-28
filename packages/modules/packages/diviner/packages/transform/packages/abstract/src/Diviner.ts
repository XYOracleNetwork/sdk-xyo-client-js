import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  PayloadTransformer,
  Transform,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
  TransformDivinerSchema,
} from '@xyo-network/diviner-transform-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override divineHandler(payloads?: Payload[]): Payload[] {
    const transforms: Transform[] = []
    if (this.config.transform) {
      transforms.push({ schema: TransformDivinerSchema, transform: this.config.transform })
    }
    return transforms.flatMap((transform) => payloads?.map(this.transformer(transform)) || [])
  }

  protected abstract transformer<TSource extends Payload = Payload, TDestination extends Payload = Payload>(
    transform: Transform,
  ): PayloadTransformer<TSource, TDestination>
}
