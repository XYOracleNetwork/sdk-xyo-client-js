import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { AddressChainDivinerParams } from '@xyo-network/diviner-address-chain-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class AddressChainDiviner<
  TParams extends AddressChainDivinerParams = AddressChainDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
