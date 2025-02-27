import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { JsonPatchDivinerConfigSchema, JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload, Schema } from '@xyo-network/payload-model'
import fastJsonPatch, { applyPatch, Operation } from 'fast-json-patch'

const FJP = fastJsonPatch as { applyPatch: typeof applyPatch }

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
          const result = FJP.applyPatch(payload, this.operations, false, false)
          return result[0].newDocument as unknown as TOut
        } catch (error) {
          this.logger?.error('JsonPatchDiviner: failed to apply patch', error)
          return
        }
      })
      .filter(exists)
    return await Promise.resolve(results ?? [])
  }
}
