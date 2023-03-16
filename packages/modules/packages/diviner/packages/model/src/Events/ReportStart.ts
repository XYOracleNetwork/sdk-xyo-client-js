import { EventData, ModuleEventArgs } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { DivinerModule } from '../Diviner'

export type DivinerReportStartEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    inPayloads?: XyoPayload[]
  }
>

export interface DivinerReportStartEventData extends EventData {
  reportStart: DivinerReportStartEventArgs
}
