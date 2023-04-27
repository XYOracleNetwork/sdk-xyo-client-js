import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressHistoryDivinerParams } from '@xyo-network/addresshistory-diviner-model'

export type AddressHistoryDiviner<TParams extends AddressHistoryDivinerParams = AddressHistoryDivinerParams> = AbstractDiviner<TParams>
