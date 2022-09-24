export * from './Divine'

import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQueryBase = XyoDivinerDivineQuery

export type XyoDivinerQuery<TQuery extends XyoQuery | void = void> = XyoModuleQuery<
  TQuery extends XyoQuery ? XyoDivinerQueryBase | TQuery : XyoDivinerQueryBase
>
