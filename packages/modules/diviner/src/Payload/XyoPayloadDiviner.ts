import { XyoAbstractDiviner, XyoDivinerConfig } from '../Abstract'
import { XyoPayloadDivinerQueryPayload } from './XyoPayloadDivinerQueryPayload'

export abstract class XyoPayloadDiviner<
  Q extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload,
  C extends XyoDivinerConfig = XyoDivinerConfig,
> extends XyoAbstractDiviner<Q, C> {}
