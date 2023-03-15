import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type SentinelReportStartEventArgs = ModuleEventArgs<{
  inPayloads?: XyoPayload[]
}>

export interface SentinelReportStartEventData extends EventData {
  reportStart: SentinelReportStartEventArgs
}
