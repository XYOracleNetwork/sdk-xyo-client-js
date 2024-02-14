import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessStatsDivinerParams } from '@xyo-network/diviner-boundwitness-stats-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class BoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}
