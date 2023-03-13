import { EventData, ModuleEventArgs } from '@xyo-network/module'

export type SentinelReportStartEventArgs = ModuleEventArgs

export interface SentinelReportStartEventData extends EventData {
  reportStart: SentinelReportStartEventArgs
}
