import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitnessStatsDivinerParams } from '@xyo-network/diviner-boundwitness-stats-model'

export abstract class BoundWitnessStatsDiviner<
  TParams extends BoundWitnessStatsDivinerParams = BoundWitnessStatsDivinerParams,
> extends AbstractDiviner<TParams> {}
