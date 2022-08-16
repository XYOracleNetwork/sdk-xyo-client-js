import { XyoModuleConfig } from '@xyo-network/module'

import { XyoAbstractDiviner } from '../Abstract'
import { XyoPayloadDivinerQueryPayload } from './XyoPayloadDivinerQueryPayload'

export abstract class XyoPayloadDiviner<
  Q extends XyoPayloadDivinerQueryPayload = XyoPayloadDivinerQueryPayload,
  C extends XyoModuleConfig = XyoModuleConfig,
> extends XyoAbstractDiviner<Q, C> {}
