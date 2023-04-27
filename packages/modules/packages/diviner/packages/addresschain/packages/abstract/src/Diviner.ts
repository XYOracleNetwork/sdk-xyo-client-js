import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressChainDivinerParams } from '@xyo-network/diviner-address-chain-model'

export type AddressChainDiviner<TParams extends AddressChainDivinerParams = AddressChainDivinerParams> = AbstractDiviner<TParams>
