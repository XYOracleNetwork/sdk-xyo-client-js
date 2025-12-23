import { assertEx, exists } from '@xylabs/sdk-js'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-model'
import { JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { creatableModule } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type { applyPatch, Operation } from 'fast-json-patch'
import fastJsonPatch from 'fast-json-patch'

const FJP = fastJsonPatch as { applyPatch: typeof applyPatch }

@creatableModule()
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
