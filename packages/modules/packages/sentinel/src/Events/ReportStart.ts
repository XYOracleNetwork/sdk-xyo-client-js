import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { SentinelModule } from '../SentinelModel'

export type SentinelReportStartEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    inPayloads?: XyoPayload[]
  }
>

export interface SentinelReportStartEventData extends EventData {
  reportStart: SentinelReportStartEventArgs
}
