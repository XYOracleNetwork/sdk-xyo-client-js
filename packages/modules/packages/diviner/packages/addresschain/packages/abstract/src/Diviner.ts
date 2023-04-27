import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressChainDivinerParams } from '@xyo-network/diviner-address-chain-model'

export abstract class AddressChainDiviner<TParams extends AddressChainDivinerParams = AddressChainDivinerParams> extends AbstractDiviner<TParams> {}
