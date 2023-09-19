import { assertEx } from '@xylabs/assert'
import { AbstractTransformDiviner, TransformDivinerParams } from '@xyo-network/diviner-transform-abstract'
import { PayloadTransformer, TransformDivinerConfigSchema } from '@xyo-network/diviner-transform-model'
import { Payload } from '@xyo-network/payload-model'
import { ValueSchema } from '@xyo-network/value-payload-plugin'
import jsonpath from 'jsonpath'

const getJsonPathTransformer = <TSource extends Payload = Payload, TDestination extends Payload = Payload>(
  pathExpression: string,
): PayloadTransformer<TSource, TDestination> => {
  const transformer: PayloadTransformer<TSource, TDestination> = (x: TSource) => {
    // eslint-disable-next-line import/no-named-as-default-member
    const value = jsonpath.value(x, pathExpression)
    // TODO: Render this cast unnecessary
    return { schema: ValueSchema, value } as unknown as TDestination
  }
  return transformer
}

export class MemoryTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractTransformDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override transformer<TSource extends Payload = Payload, TDestination extends Payload = Payload>(): PayloadTransformer<
    TSource,
    TDestination
  > {
    const pathExpression = assertEx(this.config.jsonPathExpression, 'Missing jsonPathExpression in config')
    return getJsonPathTransformer(pathExpression)
  }
}
