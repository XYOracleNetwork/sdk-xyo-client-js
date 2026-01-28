import { asSchema, type Query } from '@xyo-network/payload-model'

export const SentinelReportQuerySchema = asSchema('network.xyo.query.sentinel.report', true)
export type SentinelReportQuerySchema = typeof SentinelReportQuerySchema

export type SentinelReportQuery = Query<{
  schema: SentinelReportQuerySchema
}>
