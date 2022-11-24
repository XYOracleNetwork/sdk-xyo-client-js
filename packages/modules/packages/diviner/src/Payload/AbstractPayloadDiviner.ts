import { AbstractDiviner } from '../AbstractDiviner'
import { DivinerConfig } from '../Config'

export abstract class AbstractPayloadDiviner<C extends DivinerConfig = DivinerConfig> extends AbstractDiviner<C> {}

/** @deprecated use AbstractPayloadDiviner instead */
export abstract class XyoPayloadDiviner<C extends DivinerConfig = DivinerConfig> extends AbstractPayloadDiviner<C> {}
