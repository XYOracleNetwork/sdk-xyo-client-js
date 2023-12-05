import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { JsonPatchDivinerConfigSchema, JsonPatchDivinerParams } from '@xyo-network/diviner-jsonpatch-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export class JsonPatchDiviner<
  TParams extends JsonPatchDivinerParams = JsonPatchDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [JsonPatchDivinerConfigSchema]

  protected override async divineHandler(_payloads?: TIn[]): Promise<TOut[]> {
    return await Promise.resolve([])
  }
}
