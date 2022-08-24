import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../Config'
import { XyoDivinerQueryPayload } from '../Query'
import { XyoDiviner } from '../XyoDiviner'

export abstract class XyoPayloadDiviner<
  T extends XyoPayload = XyoPayload,
  C extends XyoDivinerConfig<T> = XyoDivinerConfig<T>,
  Q extends XyoDivinerQueryPayload<T> = XyoDivinerQueryPayload<T>,
> extends XyoDiviner<T, C, Q> {}
