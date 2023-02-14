export * from './Report'

import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { SentinelReportQuery } from './Report'

export type SentinelQueryBase = SentinelReportQuery

export type SentinelQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? SentinelQueryBase | TQuery : SentinelQueryBase
>
