export * from './Divine'

import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQueryBase = XyoDivinerDivineQuery

export type XyoDivinerQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? XyoDivinerQueryBase | TQuery : XyoDivinerQueryBase
>
