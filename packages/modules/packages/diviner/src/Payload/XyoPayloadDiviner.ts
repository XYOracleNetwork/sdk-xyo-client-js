import { XyoDivinerConfig } from '../Config'
import { XyoDiviner } from '../XyoDiviner'

export abstract class XyoPayloadDiviner<C extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<C> {}
