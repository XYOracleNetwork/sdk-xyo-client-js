import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { CoinUserLocationsDivinerParams } from '@xyo-network/diviner-coin-user-locations-model'

export abstract class CoinUserLocationsDiviner<
  TParams extends CoinUserLocationsDivinerParams = CoinUserLocationsDivinerParams,
> extends AbstractDiviner<TParams> {}
