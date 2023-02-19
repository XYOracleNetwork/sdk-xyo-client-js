export * from './Report'

import { ModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { XyoPanelReportQuery } from './Report'

export type XyoPanelQueryBase = XyoPanelReportQuery

export type XyoPanelQuery<TQuery extends XyoQuery | void = void> = ModuleQuery<
  TQuery extends XyoQuery ? XyoPanelQueryBase | TQuery : XyoPanelQueryBase
>
