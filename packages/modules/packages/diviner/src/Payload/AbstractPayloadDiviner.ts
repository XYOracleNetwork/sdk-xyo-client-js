import { AbstractDiviner, DivinerParams } from '../AbstractDiviner'

export abstract class AbstractPayloadDiviner<P extends DivinerParams = DivinerParams> extends AbstractDiviner<P> {}
