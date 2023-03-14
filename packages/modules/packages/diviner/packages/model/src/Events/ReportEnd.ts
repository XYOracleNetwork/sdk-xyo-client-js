import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type DivinerReportEndEventArgs = ModuleEventArgs<{
  errors?: Error[]
  inPayload?: XyoPayload[]
  outPayload?: XyoPayload[]
}>

export interface DivinerReportEndEventData extends EventData {
  reportEnd: DivinerReportEndEventArgs
}
