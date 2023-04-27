import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressHistoryDivinerParams } from '@xyo-network/diviner-address-history-model'

export type AddressHistoryDiviner<TParams extends AddressHistoryDivinerParams = AddressHistoryDivinerParams> = AbstractDiviner<TParams>
