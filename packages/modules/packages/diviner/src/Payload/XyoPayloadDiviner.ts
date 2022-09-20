import { XyoDivinerConfig } from '../Config'
import { XyoDivinerQuery } from '../Queries'
import { XyoDiviner } from '../XyoDiviner'

export abstract class XyoPayloadDiviner<
  C extends XyoDivinerConfig = XyoDivinerConfig,
  Q extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoDiviner<C, Q> {}
