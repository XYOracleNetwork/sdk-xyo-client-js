import { Query } from '@xyo-network/payload-model'

export const SentinelReportQuerySchema = 'network.xyo.query.sentinel.report' as const
export type SentinelReportQuerySchema = typeof SentinelReportQuerySchema

export type SentinelReportQuery = Query<{
  schema: SentinelReportQuerySchema
}>
