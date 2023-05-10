export * from './Divine'

import { ModuleQuery, ModuleQueryBase, Query } from '@xyo-network/module-model'

import { DivinerDivineQuery } from './Divine'

export type DivinerQueryBase = DivinerDivineQuery
export type DivinerQueries = ModuleQueryBase | DivinerQueryBase
export type DivinerQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? DivinerQueryBase | TQuery : DivinerQueryBase>
