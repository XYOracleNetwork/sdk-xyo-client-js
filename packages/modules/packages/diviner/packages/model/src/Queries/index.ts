export * from './Divine'

import { ModuleQuery, Query } from '@xyo-network/module-model'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQueryBase = XyoDivinerDivineQuery

export type XyoDivinerQuery<TQuery extends Query | void = void> = ModuleQuery<
  TQuery extends Query ? XyoDivinerQueryBase | TQuery : XyoDivinerQueryBase
>
