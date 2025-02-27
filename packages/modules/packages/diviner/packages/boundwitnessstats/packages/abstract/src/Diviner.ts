import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { BoundWitnessStatsDivinerParams } from '@xyo-network/diviner-boundwitness-stats-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload-model'

export abstract class BoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}
