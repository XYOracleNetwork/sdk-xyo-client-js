import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDivinerParams } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class PayloadDiviner<
  TParams extends PayloadDivinerParams = PayloadDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
