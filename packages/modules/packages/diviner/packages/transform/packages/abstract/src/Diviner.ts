import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  isTransformDivinerQueryPayload,
  PayloadTransformer,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
} from '@xyo-network/diviner-transform-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override divineHandler(payloads?: Payload[]): Payload[] {
    return payloads?.filter((p) => !isTransformDivinerQueryPayload(p)).map(this.transformer()) || []
  }

  protected abstract transformer<TSource extends Payload = Payload, TDestination extends Payload = Payload>(): PayloadTransformer<
    TSource,
    TDestination
  >
}
