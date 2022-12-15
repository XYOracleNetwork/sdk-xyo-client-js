export * from './Report'

import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoPanelReportQuery } from './Report'

export type XyoPanelQueryBase = XyoPanelReportQuery

export type XyoPanelQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? XyoPanelQueryBase | TQuery : XyoPanelQueryBase
>
