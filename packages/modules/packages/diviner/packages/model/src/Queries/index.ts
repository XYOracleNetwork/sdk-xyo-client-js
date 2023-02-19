export * from './Divine'

import { ModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQueryBase = XyoDivinerDivineQuery

export type XyoDivinerQuery<TQuery extends XyoQuery | void = void> = ModuleQuery<
  TQuery extends XyoQuery ? XyoDivinerQueryBase | TQuery : XyoDivinerQueryBase
>
