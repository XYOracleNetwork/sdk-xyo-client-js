import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { CoinUserLocationsDivinerParams } from '@xyo-network/diviner-coin-user-locations-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class CoinUserLocationsDiviner<
  TParams extends CoinUserLocationsDivinerParams = CoinUserLocationsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}
