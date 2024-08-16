export * from './Report.ts'

import type { ModuleQueries } from '@xyo-network/module-model'

import type { SentinelReportQuery } from './Report.ts'

export type SentinelQueries = SentinelReportQuery
export type SentinelModuleQueries = ModuleQueries | SentinelQueries
