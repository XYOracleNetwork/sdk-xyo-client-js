import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { JsonPatchDivinerConfigSchema, JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload, Schema } from '@xyo-network/payload-model'
// eslint-disable-next-line import/no-internal-modules
import { applyPatch, Operation } from 'json-joy/lib/json-patch/index.js'

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
  static override configSchemas: Schema[] = [...super.configSchemas, JsonPatchDivinerConfigSchema]
  static override defaultConfigSchema: Schema = JsonPatchDivinerConfigSchema

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
