import { XyoAbstractModule } from '@xyo-network/module'

import { XyoDivinerConfig } from './Config'
import { XyoDiviner, XyoDivinerQueryPayload } from './Diviner'

export abstract class XyoAbstractDiviner<
    TConfig extends XyoDivinerConfig = XyoDivinerConfig,
    TQuery extends XyoDivinerQueryPayload = XyoDivinerQueryPayload,
  >
  extends XyoAbstractModule<TConfig, TQuery>
  implements XyoDiviner<TQuery> {}

export abstract class XyoAbstractTimestampDiviner<C extends XyoDivinerConfig = XyoDivinerConfig> extends XyoAbstractDiviner<C> {}
