export * from './Report.js'

import { ModuleQueries } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report.js'

export type SentinelQueries = SentinelReportQuery
export type SentinelModuleQueries = ModuleQueries | SentinelQueries
