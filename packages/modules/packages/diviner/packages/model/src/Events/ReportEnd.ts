import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { DivinerModule } from '../Diviner'

export type DivinerReportEndEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    errors?: Error[]
    inPayloads?: XyoPayload[]
    outPayloads: XyoPayload[]
  }
>

export interface DivinerReportEndEventData extends EventData {
  reportEnd: DivinerReportEndEventArgs
}
