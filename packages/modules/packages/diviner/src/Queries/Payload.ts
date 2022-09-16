import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerDivineQuery } from './Divine'

type XyoDivinerQueryBase<TDivineResult extends XyoPayload = XyoPayload> = XyoDivinerDivineQuery<TDivineResult> | XyoModuleQuery

export type XyoDivinerQuery<TDivineResult extends XyoPayload = XyoPayload, TQuery extends XyoQuery | void = void> = TQuery extends XyoQuery
  ? XyoDivinerQueryBase<TDivineResult> | TQuery
  : XyoDivinerQueryBase<TDivineResult>
