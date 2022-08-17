import { XyoAbstractModule, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDiviner, XyoDivinerQueryPayload } from './Diviner'

export type XyoDivinerConfig<T extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    targetSchema: string
  } & T
>
export abstract class XyoAbstractDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload, C extends XyoDivinerConfig = XyoDivinerConfig>
  extends XyoAbstractModule<Q, C>
  implements XyoDiviner<Q> {}

export abstract class XyoAbstractTimestampDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> extends XyoAbstractDiviner<Q> {}
