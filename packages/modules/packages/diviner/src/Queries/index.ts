export * from './Divine'

import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQueryBase<TDivineResult extends XyoPayload = XyoPayload> = XyoDivinerDivineQuery<TDivineResult>

export type XyoDivinerQuery<TDivineResult extends XyoPayload = XyoPayload, TQuery extends XyoQuery | void = void> = TQuery extends XyoQuery
  ? XyoModuleQuery<XyoDivinerQueryBase<TDivineResult> | TQuery>
  : XyoModuleQuery<XyoDivinerQueryBase<TDivineResult>>

export type XyoDivinerQuerySchema = XyoDivinerQuery['schema']
