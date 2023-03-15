import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type DivinerReportStartEventArgs = ModuleEventArgs<{
  inPayloads?: XyoPayload[]
}>

export interface DivinerReportStartEventData extends EventData {
  reportStart: DivinerReportStartEventArgs
}
