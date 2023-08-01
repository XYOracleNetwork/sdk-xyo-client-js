export * from './Report'

import { ModuleQuery, ModuleQueryBase } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

import { SentinelReportQuery } from './Report'

export type SentinelQueryBase = SentinelReportQuery
export type SentinelModuleQueries = ModuleQueryBase | SentinelQueryBase
export type SentinelQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? SentinelQueryBase | TQuery : SentinelQueryBase>
