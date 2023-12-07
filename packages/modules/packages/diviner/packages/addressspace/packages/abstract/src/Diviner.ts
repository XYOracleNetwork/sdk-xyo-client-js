import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class AddressSpaceDiviner<
  TParams extends AddressSpaceDivinerParams = AddressSpaceDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
