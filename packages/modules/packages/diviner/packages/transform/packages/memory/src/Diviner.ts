import type { TransformDivinerParams } from '@xyo-network/diviner-transform-abstract'
import { AbstractTransformDiviner } from '@xyo-network/diviner-transform-abstract'
import type { PayloadTransformer, Transform } from '@xyo-network/diviner-transform-model'
import { TransformDivinerConfigSchema } from '@xyo-network/diviner-transform-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { ValueSchema } from '@xyo-network/value-payload-plugin'
import jsonpath from 'jsonpath'

const getJsonPathTransformer = <TSource extends Payload = Payload, TDestination extends Payload = Payload>(
  transform: Transform,
): PayloadTransformer<TSource, TDestination> => {
  const transformer: PayloadTransformer<TSource, TDestination> = (source: TSource) => {
    const value = Object.fromEntries(
      Object.entries(transform.transform).map(([key, pathExpression]) => {
        const value = jsonpath.value(source, pathExpression)
        return [key, value]
      }),
    )
    // TODO: Render this cast unnecessary
    return { schema: ValueSchema, value } as unknown as TDestination
  }
  return transformer
}

export class MemoryTransformDiviner<
  TParams extends TransformDivinerParams = TransformDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractTransformDiviner<TParams, TIn, TOut> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TransformDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = TransformDivinerConfigSchema

  protected override transformer(transform: Transform) {
    return getJsonPathTransformer<TIn, TOut>(transform)
  }
}
