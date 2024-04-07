import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { CoinUserLocationsDivinerParams } from '@xyo-network/diviner-coin-user-locations-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class CoinUserLocationsDiviner<
  TParams extends CoinUserLocationsDivinerParams = CoinUserLocationsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams['config'], TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams['config'], TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
