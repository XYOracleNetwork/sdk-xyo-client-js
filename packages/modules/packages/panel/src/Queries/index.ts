export * from './Report'

import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoPanelReportQuery } from './Report'

export type XyoPanelQueryBase = XyoPanelReportQuery

export type XyoPanelQuery<TQuery extends XyoQuery | void = void> = XyoModuleQuery<
  TQuery extends XyoQuery ? XyoPanelQueryBase | TQuery : XyoPanelQueryBase
>
