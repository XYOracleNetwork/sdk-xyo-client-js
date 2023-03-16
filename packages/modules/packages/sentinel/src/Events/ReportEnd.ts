import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { SentinelModule } from '../SentinelModel'

export type SentinelReportEndEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    boundWitness?: XyoBoundWitness
    errors?: Error[]
    inPayloads?: XyoPayload[]
    outPayloads: XyoPayload[]
  }
>

export interface SentinelReportEndEventData extends EventData {
  reportEnd: SentinelReportEndEventArgs
}
