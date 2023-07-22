import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'

export abstract class AbstractPayloadDiviner<P extends DivinerParams = DivinerParams> extends AbstractDiviner<P> {}
