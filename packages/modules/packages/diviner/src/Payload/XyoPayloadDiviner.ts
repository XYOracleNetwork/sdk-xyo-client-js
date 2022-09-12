import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../Config'
import { XyoDivinerQuery } from '../Queries'
import { XyoDiviner } from '../XyoDiviner'

export abstract class XyoPayloadDiviner<
  T extends XyoPayload = XyoPayload,
  C extends XyoDivinerConfig<T> = XyoDivinerConfig<T>,
  Q extends XyoDivinerQuery<T> = XyoDivinerQuery<T>,
> extends XyoDiviner<T, C, Q> {}
