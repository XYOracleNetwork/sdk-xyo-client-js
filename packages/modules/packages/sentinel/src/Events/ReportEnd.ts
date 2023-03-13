import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData, ModuleEventArgs } from '@xyo-network/module'

export type SentinelReportEndEventArgs = ModuleEventArgs<{
  boundWitness?: XyoBoundWitness
  errors?: Error[]
}>

export interface SentinelReportEndEventData extends EventData {
  reportEnd: SentinelReportEndEventArgs
}
