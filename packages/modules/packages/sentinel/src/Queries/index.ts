export * from './Report'

import { ModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report'

export type SentinelQueryBase = SentinelReportQuery

export type SentinelQuery<TQuery extends XyoQuery | void = void> = ModuleQuery<
  TQuery extends XyoQuery ? SentinelQueryBase | TQuery : SentinelQueryBase
>
