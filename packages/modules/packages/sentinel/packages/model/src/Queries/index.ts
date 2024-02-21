export * from './Report'

import { ModuleQueries } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report'

export type SentinelQueries = SentinelReportQuery
export type SentinelModuleQueries = ModuleQueries | SentinelQueries
