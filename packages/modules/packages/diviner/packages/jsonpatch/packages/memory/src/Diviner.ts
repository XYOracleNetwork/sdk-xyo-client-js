import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-model'
import { JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
// eslint-disable-next-line import-x/no-internal-modules
import type { Operation } from 'json-joy-16-19-0/lib/json-patch'
// eslint-disable-next-line import-x/no-internal-modules
import { applyPatch } from 'json-joy-16-19-0/lib/json-patch'

export class JsonPatchDiviner<
  TParams extends JsonPatchDivinerParams = JsonPatchDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, JsonPatchDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = JsonPatchDivinerConfigSchema

  protected get operations(): readonly Operation[] {
    return assertEx(this.config?.operations, () => 'JsonPatchDiviner: invalid operations')
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const results = payloads
      ?.map((payload) => {
        try {
          const result = applyPatch(payload, this.operations, { mutate: false })
          return result.res?.[0]?.doc as TOut
        } catch {
          return
        }
      })
      .filter(exists)
    return await Promise.resolve(results ?? [])
  }
}
