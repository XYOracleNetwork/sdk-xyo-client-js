import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressHistoryDivinerParams } from '@xyo-network/diviner-address-history-model'

export abstract class AddressHistoryDiviner<
  TParams extends AddressHistoryDivinerParams = AddressHistoryDivinerParams,
> extends AbstractDiviner<TParams> {}
