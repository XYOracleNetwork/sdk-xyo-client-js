import { XyoQuery } from '@xyo-network/module-model'

export type SentinelReportQuerySchema = 'network.xyo.query.sentinel.report'
export const SentinelReportQuerySchema: SentinelReportQuerySchema = 'network.xyo.query.sentinel.report'

export type SentinelReportQuery = XyoQuery<{
  schema: SentinelReportQuerySchema
}>
