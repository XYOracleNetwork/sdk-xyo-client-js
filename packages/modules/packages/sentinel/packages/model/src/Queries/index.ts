export * from './Report.ts'

import { ModuleQueries } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report.ts'

export type SentinelQueries = SentinelReportQuery
export type SentinelModuleQueries = ModuleQueries | SentinelQueries
