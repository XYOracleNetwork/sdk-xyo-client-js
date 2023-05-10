export * from './Report'

import { ModuleQuery, ModuleQueryBase, Query } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report'

export type SentinelQueryBase = SentinelReportQuery
export type SentinelQueries = ModuleQueryBase | SentinelQueryBase
export type SentinelQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? SentinelQueryBase | TQuery : SentinelQueryBase>
