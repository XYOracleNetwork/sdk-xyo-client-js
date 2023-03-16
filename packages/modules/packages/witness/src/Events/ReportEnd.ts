import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type WitnessReportEndEventArgs = ModuleEventArgs<{
  errors?: Error[]
  inPayloads?: XyoPayload[]
  outPayloads?: XyoPayload[]
}>

export interface WitnessReportEndEventData extends EventData {
  reportEnd: WitnessReportEndEventArgs
}
