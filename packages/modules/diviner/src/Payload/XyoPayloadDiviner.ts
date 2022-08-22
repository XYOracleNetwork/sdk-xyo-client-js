import { XyoAbstractDiviner } from '../Abstract'
import { XyoDivinerConfig } from '../Config'

export abstract class XyoPayloadDiviner<C extends XyoDivinerConfig = XyoDivinerConfig> extends XyoAbstractDiviner<C> {}
