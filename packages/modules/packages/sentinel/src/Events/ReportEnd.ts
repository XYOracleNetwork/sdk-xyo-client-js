import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type SentinelReportEndEventArgs = ModuleEventArgs<{
  boundWitness?: XyoBoundWitness
  errors?: Error[]
  inPayloads?: XyoPayload[]
  outPayloads: XyoPayload[]
}>

export interface SentinelReportEndEventData extends EventData {
  reportEnd: SentinelReportEndEventArgs
}
