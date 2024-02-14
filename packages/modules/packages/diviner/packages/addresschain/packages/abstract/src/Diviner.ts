import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { AddressChainDivinerParams } from '@xyo-network/diviner-address-chain-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class AddressChainDiviner<
  TParams extends AddressChainDivinerParams = AddressChainDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}
