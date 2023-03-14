import { DivinerParams } from '@xyo-network/diviner-model'

import { AbstractDiviner } from '../AbstractDiviner'

export abstract class AbstractPayloadDiviner<P extends DivinerParams = DivinerParams> extends AbstractDiviner<P> {}
