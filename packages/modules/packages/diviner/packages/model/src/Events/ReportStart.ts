import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type DivinerReportStartEventArgs = ModuleEventArgs<{
  inPayload?: XyoPayload[]
}>

export interface DivinerReportStartEventData extends EventData {
  reportStart: DivinerReportStartEventArgs
}
