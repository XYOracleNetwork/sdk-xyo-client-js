export * from './Divine'

import { ModuleQuery, ModuleQueryBase } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

import { DivinerDivineQuery } from './Divine'

export type DivinerQueryBase = DivinerDivineQuery
export type DivinerModuleQueries = ModuleQueryBase | DivinerQueryBase
export type DivinerQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? DivinerQueryBase | TQuery : DivinerQueryBase>
