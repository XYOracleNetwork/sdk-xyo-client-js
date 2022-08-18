import { XyoAbstractDiviner } from '../Abstract'
import { XyoDivinerConfig } from '../Config'
import { XyoPayloadDivinerQueryPayload } from './Query'

export abstract class XyoPayloadDiviner<
  Q extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload,
  C extends XyoDivinerConfig = XyoDivinerConfig,
> extends XyoAbstractDiviner<Q, C> {}
