import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessStatsDivinerParams } from '@xyo-network/diviner-boundwitness-stats-model'

export abstract class BoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
> extends AbstractDiviner<TParams> {}
