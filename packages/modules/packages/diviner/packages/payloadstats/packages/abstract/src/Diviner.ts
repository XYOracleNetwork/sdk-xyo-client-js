import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import type { PayloadStatsDivinerParams } from '@xyo-network/diviner-payload-stats-model'
import type { Payload } from '@xyo-network/payload-model'

export abstract class PayloadStatsDiviner<
  TParams extends PayloadStatsDivinerParams = PayloadStatsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
