import { XyoAbstractDiviner } from '../Diviner'
import { XyoPayloadDivinerQueryPayload } from './XyoPayloadDivinerQueryPayload'

export abstract class XyoPayloadDiviner<
  TQueryPayload extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload
> extends XyoAbstractDiviner<TQueryPayload> {}
