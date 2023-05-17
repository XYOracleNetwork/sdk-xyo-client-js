import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitnessDivinerParams } from '@xyo-network/diviner-boundwitness-model'

export abstract class BoundWitnessDiviner<TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams> extends AbstractDiviner<TParams> {}
