import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { JsonPathDivinerConfigSchema, JsonPathDivinerParams } from '@xyo-network/diviner-jsonpath-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export class JsonPathDiviner<
  TParams extends JsonPathDivinerParams = JsonPathDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [JsonPathDivinerConfigSchema]

  protected get operations(): readonly Operation[] {
    return assertEx(this.config?.operations, 'JsonPathDiviner: invalid operations')
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const results = payloads
      ?.map((payload) => {
        try {
          const result = applyPatch(payload, this.operations, { mutate: false })
          return result.res?.[0]?.doc as TOut
        } catch (e) {
          return undefined
        }
      })
      .filter(exists)
    return await Promise.resolve(results ?? [])
  }
}
