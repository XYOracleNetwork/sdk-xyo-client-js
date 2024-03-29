import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class AddressSpaceDiviner<
  TParams extends AddressSpaceDivinerParams = AddressSpaceDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
