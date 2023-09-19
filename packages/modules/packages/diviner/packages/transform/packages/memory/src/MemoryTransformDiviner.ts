import { assertEx } from '@xylabs/assert'
import { AbstractTransformDiviner, TransformDivinerParams } from '@xyo-network/diviner-transform-abstract'
import { PayloadTransformer, PayloadValueTransformer, TransformDivinerConfigSchema } from '@xyo-network/diviner-transform-model'
import { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

const getJsonPathTransformer = (pathExpression: string): PayloadValueTransformer => {
  const transformer: PayloadValueTransformer = (x: Payload) => {
    // eslint-disable-next-line import/no-named-as-default-member
    return jsonpath.value(x, pathExpression)
  }
  return transformer
}

export class MemoryTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractTransformDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override get transformer<TSource extends Payload = Payload, TDestination extends Payload = Payload>(): PayloadTransformer<
    TSource,
    TDestination
  > {
    const pathExpression = assertEx(this.config.jsonPathExpression, 'Missing jsonPathExpression in config')
    return getJsonPathTransformer(pathExpression)
  }
}
