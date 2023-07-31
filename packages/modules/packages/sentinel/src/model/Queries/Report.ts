import { Query } from '@xyo-network/payload-model'

export type SentinelReportQuerySchema = 'network.xyo.query.sentinel.report'
export const SentinelReportQuerySchema: SentinelReportQuerySchema = 'network.xyo.query.sentinel.report'

export type SentinelReportQuery = Query<{
  schema: SentinelReportQuerySchema
}>
