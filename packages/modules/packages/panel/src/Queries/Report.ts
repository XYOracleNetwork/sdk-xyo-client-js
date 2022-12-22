import { XyoQuery } from '@xyo-network/module-model'

export type XyoPanelReportQuerySchema = 'network.xyo.query.panel.report'
export const XyoPanelReportQuerySchema: XyoPanelReportQuerySchema = 'network.xyo.query.panel.report'

export type XyoPanelReportQuery = XyoQuery<{
  schema: XyoPanelReportQuerySchema
}>
