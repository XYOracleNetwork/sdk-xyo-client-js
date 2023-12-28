import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { CoinUserLocationsDivinerParams } from '@xyo-network/diviner-coin-user-locations-model'

export abstract class CoinUserLocationsDiviner<
  TParams extends CoinUserLocationsDivinerParams = CoinUserLocationsDivinerParams,
> extends AbstractDiviner<TParams> {}
