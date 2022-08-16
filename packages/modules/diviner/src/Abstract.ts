import { XyoAbstractModule, XyoModuleConfig } from '@xyo-network/module'

import { XyoDiviner, XyoDivinerQueryPayload } from './Diviner'
export abstract class XyoAbstractDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload, C extends XyoModuleConfig = XyoModuleConfig>
  extends XyoAbstractModule<Q, C>
  implements XyoDiviner<Q> {}

export abstract class XyoAbstractTimestampDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> extends XyoAbstractDiviner<Q> {}
