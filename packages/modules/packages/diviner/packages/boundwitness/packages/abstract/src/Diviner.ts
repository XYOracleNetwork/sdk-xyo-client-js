import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessDivinerParams } from '@xyo-network/diviner-boundwitness-model'

export abstract class BoundWitnessDiviner<TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams> extends AbstractDiviner<TParams> {}
