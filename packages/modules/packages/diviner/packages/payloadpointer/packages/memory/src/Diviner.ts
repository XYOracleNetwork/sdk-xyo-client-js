import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadPointerDivinerConfigSchema, PayloadPointerDivinerParams } from '@xyo-network/diviner-payload-pointer-model'
import { Payload, Schema } from '@xyo-network/payload-model'

export class JsonPathDiviner<
  TParams extends PayloadPointerDivinerParams = PayloadPointerDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, PayloadPointerDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = PayloadPointerDivinerConfigSchema

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    if (!payloads) return []
    // Create the indexes from the tuples
    return await Promise.all(
      payloads.map<Promise<TOut>>(async () => {
        await Promise.resolve()
        throw new Error('Not implemented')
      }),
    )
  }
}
