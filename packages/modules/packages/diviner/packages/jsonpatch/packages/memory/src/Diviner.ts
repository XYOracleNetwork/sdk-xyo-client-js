import { AbstractTransformDiviner, TransformDivinerParams } from '@xyo-network/diviner-jsonpatch-abstract'
import { PayloadTransformer, Transform, TransformDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import { Payload } from '@xyo-network/payload-model'
import { ValueSchema } from '@xyo-network/value-payload-plugin'
import jsonpath from 'jsonpath'

const getJsonPathTransformer = <TSource extends Payload = Payload, TDestination extends Payload = Payload>(
  jsonpatch: Transform,
): PayloadTransformer<TSource, TDestination> => {
  const jsonpatcher: PayloadTransformer<TSource, TDestination> = (source: TSource) => {
    const value = Object.fromEntries(
      Object.entries(jsonpatch.jsonpatch).map(([key, pathExpression]) => {
        // eslint-disable-next-line import/no-named-as-default-member
        const value = jsonpath.value(source, pathExpression)
        return [key, value]
      }),
    )
    // TODO: Render this cast unnecessary
    return { schema: ValueSchema, value } as unknown as TDestination
  }
  return jsonpatcher
}

export class MemoryTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractTransformDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override jsonpatcher<TSource extends Payload = Payload, TDestination extends Payload = Payload>(
    jsonpatch: Transform,
  ): PayloadTransformer<TSource, TDestination> {
    return getJsonPathTransformer(jsonpatch)
  }
}
