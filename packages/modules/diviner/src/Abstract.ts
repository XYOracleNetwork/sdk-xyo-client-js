import { XyoAbstractModule } from '@xyo-network/module'

import { XyoDivinerConfig } from './Config'
import { XyoDiviner, XyoDivinerQueryPayload } from './Diviner'

export abstract class XyoAbstractDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload, C extends XyoDivinerConfig = XyoDivinerConfig>
  extends XyoAbstractModule<Q, C>
  implements XyoDiviner<Q> {}

export abstract class XyoAbstractTimestampDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> extends XyoAbstractDiviner<Q> {}
