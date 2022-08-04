import { XyoPayload } from '@xyo-network/payload'

import { XyoAbstractDiviner } from '../Diviner'
import { XyoPayloadDivinerQueryPayload } from './XyoPayloadDivinerQueryPayload'

export abstract class XyoPayloadDiviner<
  TTargetPayload extends XyoPayload = XyoPayload,
  TQueryPayload extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload
> extends XyoAbstractDiviner<TTargetPayload, TQueryPayload> {}
