import { XyoAbstractDiviner } from '../Diviner'
import { XyoPayloadDivinerPayload } from './XyoPayloadDivinerPayload'
import { XyoPayloadDivinerQueryPayload } from './XyoPayloadDivinerQueryPayload'

export abstract class XyoPayloadDiviner<
  TTargetPayload extends XyoPayloadDivinerPayload = XyoPayloadDivinerPayload,
  TQueryPayload extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload
> extends XyoAbstractDiviner<TTargetPayload, TQueryPayload> {}
