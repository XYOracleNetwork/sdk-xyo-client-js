import { AbstractJsonPatchDiviner, JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-abstract'
import { JsonPatch, JsonPatchDivinerConfigSchema, PayloadJsonPatcher } from '@xyo-network/diviner-jsonpatch-model'
import { Payload } from '@xyo-network/payload-model'
import { ValueSchema } from '@xyo-network/value-payload-plugin'
import jsonpath from 'jsonpath'

const getJsonPathJsonPatcher = <TSource extends Payload = Payload, TDestination extends Payload = Payload>(
  jsonpatch: JsonPatch,
): PayloadJsonPatcher<TSource, TDestination> => {
  const jsonpatcher: PayloadJsonPatcher<TSource, TDestination> = (source: TSource) => {
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

export class MemoryJsonPatchDiviner<TParams extends JsonPatchDivinerParams = JsonPatchDivinerParams> extends AbstractJsonPatchDiviner<TParams> {
  static override configSchemas = [JsonPatchDivinerConfigSchema]

  protected override jsonpatcher<TSource extends Payload = Payload, TDestination extends Payload = Payload>(
    jsonpatch: JsonPatch,
  ): PayloadJsonPatcher<TSource, TDestination> {
    return getJsonPathJsonPatcher(jsonpatch)
  }
}
