import { XyoAbstractDiviner } from '../Abstract'
import { XyoDivinerConfig } from '../Config'
import { XyoPayloadDivinerQueryPayload } from './Query'

export abstract class XyoPayloadDiviner<
  C extends XyoDivinerConfig = XyoDivinerConfig,
  Q extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload,
> extends XyoAbstractDiviner<C, Q> {}
