import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDivinerConfigSchema, PayloadDivinerParams } from '@xyo-network/diviner-payload-model'
import { Payload, Schema } from '@xyo-network/payload-model'

export abstract class PayloadDiviner<
  TParams extends PayloadDivinerParams = PayloadDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, PayloadDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = PayloadDivinerConfigSchema
}
