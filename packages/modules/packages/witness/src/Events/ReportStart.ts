import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type WitnessReportStartEventArgs = ModuleEventArgs<{
  inPayload?: XyoPayload[]
}>

export interface WitnessReportStartEventData extends EventData {
  reportStart: WitnessReportStartEventArgs
}
